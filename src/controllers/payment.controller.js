const crypto = require("crypto");
const Order = require("../models/order.model");
const { getPool } = require("../db/connection");
const razorpay = require("../services/razorpay.service");

const billingFrom = (body = {}) => ({ first_name: body.first_name, last_name: body.last_name, phone: body.phone, email: body.email, country: body.country, state: body.state, city: body.city, zip_code: body.zip_code || body.zip, street_address: body.street_address || body.address });
const safeKey = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{16,100}$/.test(value) ? value : null;

async function createRazorpayOrder(req, res) {
    try {
        if (!razorpay.configured()) return res.status(503).json({ success: false, message: "Online payments are not configured yet." });
        const idempotencyKey = safeKey(req.get("Idempotency-Key") || req.body.idempotency_key);
        if (!idempotencyKey) return res.status(400).json({ success: false, message: "A valid idempotency key is required." });
        let order = await Order.findOrderByIdempotencyKey(req.user.user_id, idempotencyKey);
        if (order && order.payment_status === "paid") return res.status(409).json({ success: false, message: "This order has already been paid." });
        if (order && (order.payment_status === "failed" || order.order_status === "cancelled")) return res.status(409).json({ success: false, message: "This payment attempt is closed. Please start a new payment attempt." });

        if (!order) {
            const internalOrderId = await Order.createCheckout(req.user.user_id, "RAZORPAY", billingFrom(req.body), idempotencyKey);
            order = await Order.getOrderByIdForUser(internalOrderId, req.user.user_id);
        }

        if (!order.gateway_order_id) {
            const amount = Math.round(Number(order.total_amount) * 100);
            if (!Number.isSafeInteger(amount) || amount < 100) throw Object.assign(new Error("Order amount is invalid."), { status: 400 });
            let gatewayOrder;
            try {
                gatewayOrder = await razorpay.client().orders.create({ amount, currency: "INR", receipt: `ke_${order.order_id}`, notes: { internal_order_id: String(order.order_id), user_id: String(req.user.user_id) } });
            } catch (error) {
                await Order.markPaymentFailedAndRestoreStock(order.order_id);
                throw Object.assign(new Error("Unable to initialise Razorpay checkout. Please try again."), { status: 502 });
            }
            await Order.setGatewayOrder(order.order_id, gatewayOrder.id, amount);
            order.gateway_order_id = gatewayOrder.id;
        }
        return res.status(201).json({ success: true, internalOrderId: order.order_id, razorpayOrderId: order.gateway_order_id, amount: Math.round(Number(order.total_amount) * 100), currency: "INR", keyId: process.env.RAZORPAY_KEY_ID, name: "Khushi Enterprises" });
    } catch (error) {
        return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : "Unable to create a payment order." });
    }
}

async function verifyPayment(req, res) {
    try {
        const { internal_order_id: internalOrderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
        const order = await Order.getOrderByIdForUser(internalOrderId, req.user.user_id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        const [[payment]] = await getPool().query(`SELECT gateway_order_id, gateway_amount, gateway_currency, payment_status FROM payments WHERE order_id = ? LIMIT 1`, [order.order_id]);
        if (!payment || payment.gateway_order_id !== razorpayOrderId) return res.status(400).json({ success: false, message: "Payment order does not match." });
        if (payment.payment_status === "success") return res.json({ success: true, message: "Payment already verified.", orderId: order.order_id });
        if (!razorpay.verifyPaymentSignature(payment.gateway_order_id, paymentId, signature)) return res.status(400).json({ success: false, message: "Invalid payment signature." });
        const gatewayPayment = await razorpay.client().payments.fetch(paymentId);
        if (gatewayPayment.order_id !== payment.gateway_order_id || gatewayPayment.status !== "captured" || Number(gatewayPayment.amount) !== Number(payment.gateway_amount) || gatewayPayment.currency !== "INR") return res.status(400).json({ success: false, message: "Payment is not captured for this order." });
        await Order.markPaymentPaid(order.order_id, paymentId);
        return res.json({ success: true, message: "Payment verified.", orderId: order.order_id });
    } catch (error) { return res.status(error.status || 502).json({ success: false, message: error.status ? error.message : "Unable to verify payment." }); }
}

async function cancelPayment(req, res) {
    try {
        const order = await Order.getOrderByIdForUser(req.params.orderId, req.user.user_id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        await Order.markPaymentFailedAndRestoreStock(order.order_id);
        return res.json({ success: true, message: "Payment cancelled." });
    } catch (_) { return res.status(500).json({ success: false, message: "Unable to cancel payment." }); }
}

async function processRazorpayWebhook(req, res) {
    const rawBody = req.body;
    const signature = req.get("x-razorpay-signature");
    if (!Buffer.isBuffer(rawBody) || !process.env.RAZORPAY_WEBHOOK_SECRET || !razorpay.verifyWebhookSignature(rawBody, signature)) return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    try {
        const event = JSON.parse(rawBody.toString("utf8"));
        const eventId = req.get("x-razorpay-event-id") || crypto.createHash("sha256").update(rawBody).digest("hex");
        const pool = getPool();
        const [record] = await pool.query(`INSERT IGNORE INTO razorpay_webhook_events (event_id, event_type) VALUES (?, ?)`, [eventId, event.event || "unknown"]);
        if (!record.affectedRows) return res.status(200).json({ success: true, duplicate: true });
        const entity = event.payload?.payment?.entity;
        if (entity?.order_id) {
            const [[row]] = await pool.query(`SELECT order_id, gateway_amount FROM payments WHERE gateway_order_id = ? LIMIT 1`, [entity.order_id]);
            if (row && entity.status === "captured" && Number(entity.amount) === Number(row.gateway_amount) && entity.currency === "INR") await Order.markPaymentPaid(row.order_id, entity.id);
            if (row && (event.event === "payment.failed" || entity.status === "failed")) await Order.markPaymentFailedAndRestoreStock(row.order_id);
        }
        await pool.query(`UPDATE razorpay_webhook_events SET processed_at = CURRENT_TIMESTAMP, processing_status = 'processed' WHERE event_id = ?`, [eventId]);
        return res.status(200).json({ success: true });
    } catch (error) { return res.status(500).json({ success: false, message: "Webhook processing failed." }); }
}

async function getPaymentByOrder(req, res) {
    const order = await Order.getOrderByIdForUser(req.params.orderId, req.user.user_id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    const [payments] = await getPool().query(`SELECT payment_id, order_id, payment_method, transaction_id, payment_status, gateway_order_id, gateway_payment_id, created_at FROM payments WHERE order_id = ?`, [order.order_id]);
    return res.json({ success: true, payments });
}

module.exports = { createRazorpayOrder, verifyPayment, cancelPayment, processRazorpayWebhook, getPaymentByOrder };

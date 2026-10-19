const crypto = require("crypto");
const Razorpay = require("razorpay");

function configured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !/^REPLACE_|^YOUR_/i.test(process.env.RAZORPAY_KEY_ID));
}

function client() {
    if (!configured()) throw Object.assign(new Error("Razorpay is not configured."), { status: 503 });
    return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

function verifyPaymentSignature(orderId, paymentId, signature) {
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
    return typeof signature === "string" && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function verifyWebhookSignature(rawBody, signature) {
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "").update(rawBody).digest("hex");
    return typeof signature === "string" && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

module.exports = { configured, client, verifyPaymentSignature, verifyWebhookSignature };

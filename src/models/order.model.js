const { getPool } = require("../db/connection");

class Order {
    static async saveAddress(connection, userId, billing = {}) {
        const fullName = `${billing.first_name || ""} ${billing.last_name || ""}`.trim() || billing.full_name || null;
        const addressLine = billing.street_address || billing.address || null;
        const pincode = billing.zip_code || billing.zip || null;

        if (!addressLine && !billing.city && !billing.state && !pincode) return null;

        const [result] = await connection.query(
            `INSERT INTO addresses (user_id, full_name, phone, address_line, city, state, pincode, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [userId, fullName, billing.phone || null, addressLine, billing.city || null, billing.state || null, pincode]
        );
        return result.insertId;
    }

    static async createCheckout(userId, paymentMethod = "COD", billing = {}, idempotencyKey = null) {
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [cartItems] = await connection.query(`SELECT c.product_id, c.quantity, p.product_name, p.stock, p.status, COALESCE(p.discount_price, p.price) AS price FROM cart c INNER JOIN products p ON p.product_id = c.product_id WHERE c.user_id = ? FOR UPDATE`, [userId]);
            if (!cartItems.length) throw Object.assign(new Error("Cart is empty."), { status: 400 });
            for (const item of cartItems) {
                if (item.status !== "active" || Number(item.stock) < Number(item.quantity)) throw Object.assign(new Error(`${item.product_name} is unavailable or does not have enough stock.`), { status: 400 });
            }
            const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
            const addressId = await this.saveAddress(connection, userId, billing);
            const trackingNumber = `KE${Date.now()}`;
            const [result] = await connection.query(
                `INSERT INTO orders
                (user_id, address_id, total_amount, discount_amount, payment_method, payment_status, order_status, tracking_number, idempotency_key)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, addressId, totalAmount, 0, paymentMethod, "pending", "pending", trackingNumber, idempotencyKey]
            );
            await connection.query(
                `INSERT INTO payments (order_id, payment_method, amount, payment_status)
                 VALUES (?, ?, ?, ?)`,
                [result.insertId, paymentMethod, totalAmount, "pending"]
            );
            for (const item of cartItems) {
                const subtotal = Number(item.quantity) * Number(item.price);
                await connection.query(`INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)`, [result.insertId, item.product_id, item.quantity, item.price, subtotal]);
                const [update] = await connection.query(`UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?`, [item.quantity, item.product_id, item.quantity]);
                if (!update.affectedRows) throw Object.assign(new Error("Stock changed while placing the order. Please try again."), { status: 409 });
            }
            await connection.query(`DELETE FROM cart WHERE user_id = ?`, [userId]);
            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findOrderByIdempotencyKey(userId, key) {
        if (!key) return null;
        const [rows] = await getPool().query(`SELECT o.*, p.gateway_order_id, p.payment_id FROM orders o LEFT JOIN payments p ON p.order_id = o.order_id WHERE o.user_id = ? AND o.idempotency_key = ? LIMIT 1`, [userId, key]);
        return rows[0] || null;
    }

    static async setGatewayOrder(orderId, gatewayOrderId, amountPaise) {
        const [result] = await getPool().query(`UPDATE payments SET gateway_order_id = ?, gateway_amount = ?, gateway_currency = 'INR', payment_status = 'initiated' WHERE order_id = ? AND payment_status = 'pending'`, [gatewayOrderId, amountPaise, orderId]);
        return result;
    }

    static async markPaymentPaid(orderId, gatewayPaymentId) {
        const connection = await getPool().getConnection();
        try {
            await connection.beginTransaction();
            const [[payment]] = await connection.query(`SELECT p.payment_id, p.payment_status, o.order_status FROM payments p INNER JOIN orders o ON o.order_id = p.order_id WHERE p.order_id = ? FOR UPDATE`, [orderId]);
            if (!payment) throw Object.assign(new Error("Payment record not found."), { status: 404 });
            if (payment.payment_status === "success") { await connection.commit(); return { alreadyPaid: true }; }
            await connection.query(`UPDATE payments SET payment_status = 'success', transaction_id = ?, gateway_payment_id = ? WHERE order_id = ?`, [gatewayPaymentId, gatewayPaymentId, orderId]);
            await connection.query(`UPDATE orders SET payment_status = 'paid', order_status = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END WHERE order_id = ?`, [orderId]);
            await connection.commit();
            return { alreadyPaid: false };
        } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    }

    static async markPaymentFailedAndRestoreStock(orderId) {
        const connection = await getPool().getConnection();
        try {
            await connection.beginTransaction();
            const [[order]] = await connection.query(`SELECT order_id, payment_status, order_status FROM orders WHERE order_id = ? FOR UPDATE`, [orderId]);
            if (!order || order.payment_status === "paid" || order.order_status === "cancelled") { await connection.commit(); return false; }
            const [items] = await connection.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ? FOR UPDATE`, [orderId]);
            for (const item of items) await connection.query(`UPDATE products SET stock = stock + ? WHERE product_id = ?`, [item.quantity, item.product_id]);
            await connection.query(`UPDATE payments SET payment_status = 'failed' WHERE order_id = ? AND payment_status != 'success'`, [orderId]);
            await connection.query(`UPDATE orders SET payment_status = 'failed', order_status = 'cancelled' WHERE order_id = ?`, [orderId]);
            await connection.commit();
            return true;
        } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
    }

    static async getUserOrders(userId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT o.*, a.address_line, a.city, a.state, a.pincode
             FROM orders o
             LEFT JOIN addresses a ON o.address_id = a.address_id
             WHERE o.user_id = ?
             ORDER BY o.order_id DESC`,
            [userId]
        );
        return rows;
    }

    static async getOrderDetails(orderId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT oi.*, p.product_name, p.image, p.color, p.material, p.size
             FROM order_items oi
             INNER JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [orderId]
        );
        return rows;
    }

    static async getOrderByIdForUser(orderId, userId) {
        const pool = getPool();
        const [rows] = await pool.query(`SELECT o.*, u.email, u.name, a.address_line, a.city, a.state, a.pincode FROM orders o INNER JOIN users u ON o.user_id = u.user_id LEFT JOIN addresses a ON o.address_id = a.address_id WHERE o.order_id = ? AND o.user_id = ?`, [orderId, userId]);
        return rows[0];
    }

    static async getOrderById(orderId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT o.*, u.email, u.name, a.address_line, a.city, a.state, a.pincode
             FROM orders o
             INNER JOIN users u ON o.user_id = u.user_id
             LEFT JOIN addresses a ON o.address_id = a.address_id
             WHERE o.order_id = ?`,
            [orderId]
        );
        return rows[0];
    }

    static async getOrderByIdAndEmail(orderId, email) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT o.*, u.email, u.name, a.address_line, a.city, a.state, a.pincode
             FROM orders o
             INNER JOIN users u ON o.user_id = u.user_id
             LEFT JOIN addresses a ON o.address_id = a.address_id
             WHERE o.order_id = ? AND (? = '' OR u.email = ?)`,
            [orderId, email, email]
        );
        return rows[0];
    }

    static async getAllOrders() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT o.*, u.name, u.email AS user_email, a.address_line, a.city, a.state, a.pincode
             FROM orders o
             INNER JOIN users u ON o.user_id = u.user_id
             LEFT JOIN addresses a ON o.address_id = a.address_id
             ORDER BY o.order_id DESC`
        );
        return rows;
    }

    static async updateOrderStatus(orderId, status) {
        const pool = getPool();
        const normalized = String(status || "pending").toLowerCase();
        const deliveredAt = normalized === "delivered" ? new Date() : null;
        const [result] = await pool.query(
            `UPDATE orders
             SET order_status = ?, delivered_at = COALESCE(?, delivered_at)
             WHERE order_id = ?`,
            [normalized, deliveredAt, orderId]
        );
        return result;
    }

    static async deleteOrder(orderId) {
        const pool = getPool();
        const [result] = await pool.query(`DELETE FROM orders WHERE order_id = ?`, [orderId]);
        return result;
    }
}

module.exports = Order;

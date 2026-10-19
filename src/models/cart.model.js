const { getPool } = require("../db/connection");

class Cart {
    static async addToCart(userId, productId, quantity = 1) {
        const pool = getPool();
        const qty = Math.max(1, Number(quantity) || 1);
        const [products] = await pool.query(
            `SELECT product_id, stock, status FROM products WHERE product_id = ? LIMIT 1`,
            [productId]
        );
        if (!products.length || products[0].status !== "active") throw new Error("Product not available.");
        if (products[0].stock < qty) throw new Error("Insufficient stock.");

        const [existing] = await pool.query(`SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?`, [userId, productId]);
        const newQty = (existing[0]?.quantity || 0) + qty;
        if (newQty > products[0].stock) throw new Error("Requested quantity exceeds available stock.");

        if (existing.length) {
            return pool.query(`UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?`, [newQty, userId, productId]).then(([r]) => r);
        }
        const [result] = await pool.query(`INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`, [userId, productId, qty]);
        return result;
    }

    static async getUserCart(userId) {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT c.cart_id, c.quantity, p.product_id, p.product_name,
                   COALESCE(p.discount_price, p.price) AS price, p.image, p.color, p.material, p.size, p.stock,
                   (c.quantity * COALESCE(p.discount_price, p.price)) AS subtotal
            FROM cart c INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ? ORDER BY c.cart_id DESC`, [userId]);
        return rows;
    }

    static async updateQuantity(userId, cartId, quantity) {
        const pool = getPool();
        const qty = Math.max(1, Number(quantity) || 1);
        const [result] = await pool.query(`
            UPDATE cart c INNER JOIN products p ON c.product_id = p.product_id
            SET c.quantity = ? WHERE c.cart_id = ? AND c.user_id = ? AND p.status = 'active' AND p.stock >= ?`,
            [qty, cartId, userId, qty]
        );
        return result;
    }

    static async removeItem(userId, cartId) {
        const pool = getPool();
        const [result] = await pool.query(`DELETE FROM cart WHERE cart_id = ? AND user_id = ?`, [cartId, userId]);
        return result;
    }

    static async clearCart(userId) {
        const pool = getPool();
        const [result] = await pool.query(`DELETE FROM cart WHERE user_id = ?`, [userId]);
        return result;
    }

    static async getCartTotal(userId) {
        const pool = getPool();
        const [rows] = await pool.query(`
            SELECT COALESCE(SUM(c.quantity * COALESCE(p.discount_price, p.price)), 0) AS total
            FROM cart c INNER JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?`, [userId]);
        return rows[0];
    }
}
module.exports = Cart;

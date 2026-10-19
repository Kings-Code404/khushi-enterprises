const { getPool } = require("../db/connection");

class Product {
    static async createProduct(categoryId, productName, description, size, color, material, price, stock, image, sku = null, discountPrice = null, status = "active") {
        const pool = getPool();
        const finalSku = sku || `KE-${Date.now()}`;
        const [result] = await pool.query(
            `INSERT INTO products
            (category_id, sku, product_name, description, size, color, material, price, discount_price, stock, image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [categoryId, finalSku, productName, description, size, color, material, price, discountPrice, stock, image, status]
        );
        return result;
    }

    static async getAllProducts(includeInactive = false) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT p.*, c.category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             ${includeInactive ? "" : "WHERE p.status = 'active'"}
             ORDER BY p.product_id DESC`
        );
        return rows;
    }

    static async getProductById(productId, includeInactive = false) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT p.*, c.category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.product_id = ? ${includeInactive ? "" : "AND p.status = 'active'"}`,
            [productId]
        );
        return rows[0];
    }

    static async searchProducts(keyword) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT p.*, c.category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.category_id
             WHERE p.status = 'active'
             AND (p.product_name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );
        return rows;
    }

    static async getProductsByCategory(categoryId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM products WHERE category_id = ? AND status = 'active'`,
            [categoryId]
        );
        return rows;
    }

    static async getLatestProducts(limit = 8) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM products WHERE status = 'active' ORDER BY created_at DESC LIMIT ?`,
            [Number(limit)]
        );
        return rows;
    }

    static async updateProduct(productId, categoryId, productName, description, size, color, material, price, stock, image, sku = null, discountPrice = null, status = "active") {
        const pool = getPool();
        const [result] = await pool.query(
            `UPDATE products SET
                category_id = ?,
                sku = ?,
                product_name = ?,
                description = ?,
                size = ?,
                color = ?,
                material = ?,
                price = ?,
                discount_price = ?,
                stock = ?,
                image = ?,
                status = ?
             WHERE product_id = ?`,
            [categoryId, sku, productName, description, size, color, material, price, discountPrice, stock, image, status, productId]
        );
        return result;
    }

    static async deleteProduct(productId) {
        const pool = getPool();
        const [result] = await pool.query(`UPDATE products SET status = 'inactive' WHERE product_id = ?`, [productId]);
        return result;
    }
}

module.exports = Product;

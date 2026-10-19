const { getPool } = require("../db/connection");

class Category {

    // Create Category
    static async createCategory(categoryName) {
        const pool = getPool();

        const [result] = await pool.query(
            `INSERT INTO categories (category_name)
             VALUES (?)`,
            [categoryName]
        );

        return result;
    }

    // Get All Categories
    static async getAllCategories() {
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT *
             FROM categories
             ORDER BY category_id DESC`
        );

        return rows;
    }

    // Get Category By ID
    static async getCategoryById(categoryId) {
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT *
             FROM categories
             WHERE category_id = ?`,
            [categoryId]
        );

        return rows[0];
    }

    // Update Category
    static async updateCategory(categoryId, categoryName) {
        const pool = getPool();

        const [result] = await pool.query(
            `UPDATE categories
             SET category_name = ?
             WHERE category_id = ?`,
            [categoryName, categoryId]
        );

        return result;
    }

    // Delete Category
    static async deleteCategory(categoryId) {
        const pool = getPool();

        const [result] = await pool.query(
            `DELETE FROM categories
             WHERE category_id = ?`,
            [categoryId]
        );

        return result;
    }
}

module.exports = Category;
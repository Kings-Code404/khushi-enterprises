const { getPool } = require("../db/connection");

class User {
    static async createUser(name, email, hashedPassword, phone = null) {
        const pool = getPool();
        const [result] = await pool.query(
            `INSERT INTO users (name, email, password, phone, role, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, phone, "user", "active"]
        );
        return result;
    }

    static async findByEmail(email) {
        const pool = getPool();
        const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
        return rows[0];
    }

    static async findById(userId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT
                u.user_id,
                u.name,
                u.email,
                u.phone,
                u.profile_pic,
                u.role,
                u.status,
                u.created_at,
                u.updated_at,
                a.address_line AS address,
                a.address_id,
                a.city,
                a.state,
                a.pincode
             FROM users u
             LEFT JOIN addresses a
             ON u.user_id = a.user_id AND a.is_default = TRUE
             WHERE u.user_id = ?
             LIMIT 1`,
            [userId]
        );
        return rows[0];
    }

    static async getAllUsers() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT user_id, name, email, phone, role, status, profile_pic, created_at, updated_at
             FROM users
             ORDER BY user_id DESC`
        );
        return rows;
    }

    static async updateUser(userId, name, phone, address = null) {
        const pool = getPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.query(
                `UPDATE users SET name = ?, phone = ? WHERE user_id = ?`,
                [name, phone, userId]
            );

            if (address !== undefined && address !== null) {
                const [existing] = await connection.query(
                    `SELECT address_id FROM addresses WHERE user_id = ? AND is_default = TRUE LIMIT 1`,
                    [userId]
                );
                if (existing.length) {
                    await connection.query(
                        `UPDATE addresses SET full_name = ?, phone = ?, address_line = ? WHERE address_id = ?`,
                        [name, phone, address, existing[0].address_id]
                    );
                } else if (String(address).trim()) {
                    await connection.query(
                        `INSERT INTO addresses (user_id, full_name, phone, address_line, is_default)
                         VALUES (?, ?, ?, ?, TRUE)`,
                        [userId, name, phone, address]
                    );
                }
            }

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async deleteUser(userId) {
        const pool = getPool();
        const [result] = await pool.query(`DELETE FROM users WHERE user_id = ?`, [userId]);
        return result;
    }
}

module.exports = User;

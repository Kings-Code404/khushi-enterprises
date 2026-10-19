const bcrypt = require("bcryptjs");
const { getPool } = require("./connection");

async function seedAdmin() {
    try {
        const pool = getPool();
        const adminEmail = process.env.ADMIN_EMAIL || "admin@khushi.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        const [rows] = await pool.query(
            "SELECT user_id FROM users WHERE email = ? LIMIT 1",
            [adminEmail]
        );

        if (rows.length > 0) {
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await pool.query(
            `INSERT INTO users (name, email, password, role, status)
             VALUES (?, ?, ?, 'admin', 'active')`,
            ["Admin", adminEmail, hashedPassword]
        );

        console.log(`✅ Admin user ready: ${adminEmail}`);
    } catch (error) {
        console.error("Admin Seeder Error:", error.message);
    }
}

module.exports = seedAdmin;

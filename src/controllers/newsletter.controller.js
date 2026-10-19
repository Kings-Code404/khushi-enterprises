const { getPool } = require("../db/connection");

const subscribe = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: "Email is required." });
        const pool = getPool();
        await pool.query(
            `INSERT INTO newsletter_subscribers (email, status)
             VALUES (?, 'active')
             ON DUPLICATE KEY UPDATE status = 'active'`,
            [email]
        );
        return res.status(201).json({ success: true, message: "Newsletter subscribed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to subscribe newsletter." });
    }
};

const unsubscribe = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const pool = getPool();
        await pool.query(`UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE email = ?`, [email]);
        return res.status(200).json({ success: true, message: "Newsletter unsubscribed successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to unsubscribe newsletter." });
    }
};

module.exports = { subscribe, unsubscribe };

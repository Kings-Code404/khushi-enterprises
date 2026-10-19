const { getPool } = require("../db/connection");

const validateCoupon = async (req, res) => {
    try {
        const code = String(req.params.code || req.body.code || "").trim().toUpperCase();
        if (!code) return res.status(400).json({ success: false, message: "Coupon code is required." });

        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT * FROM coupons
             WHERE UPPER(code) = ?
             AND status = 'active'
             AND (expiry_date IS NULL OR expiry_date >= NOW())
             LIMIT 1`,
            [code]
        );

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Invalid or expired coupon." });
        }

        return res.status(200).json({ success: true, message: "Coupon applied successfully.", coupon: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to validate coupon." });
    }
};

module.exports = { validateCoupon };

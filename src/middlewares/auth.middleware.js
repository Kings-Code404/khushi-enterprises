const jwt = require("jsonwebtoken");
const { getPool } = require("../db/connection");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, message: "Access denied. Please login first." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pool = getPool();
        const [sessions] = await pool.query(
            `SELECT s.status, s.expires_at, u.status AS user_status, u.role
             FROM sessions s INNER JOIN users u ON s.user_id = u.user_id
             WHERE s.session_id = ? LIMIT 1`,
            [token.slice(0, 255)]
        );

        if (!sessions.length || sessions[0].status !== "active" || (sessions[0].expires_at && new Date(sessions[0].expires_at) < new Date())) {
            return res.status(401).json({ success: false, message: "Session expired. Please login again." });
        }
        if (sessions[0].user_status !== "active") {
            return res.status(403).json({ success: false, message: "Your account is not active." });
        }

        req.user = { ...decoded, role: sessions[0].role };
        next();
    } catch (_) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const { getPool } = require("../db/connection");

const getToken = (req) => req.cookies?.token || req.headers.authorization?.split(" ")[1];

const pageAuth = async (req, res, next) => {
    try {
        const token = getToken(req);
        if (!token) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [[session]] = await getPool().query(
            `SELECT s.status, s.expires_at, u.status AS user_status, u.role
             FROM sessions s INNER JOIN users u ON u.user_id = s.user_id
             WHERE s.session_id = ? LIMIT 1`,
            [token.slice(0, 255)]
        );
        if (!session || session.status !== "active" || session.user_status !== "active" || (session.expires_at && new Date(session.expires_at) < new Date())) {
            return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
        }
        req.user = { ...decoded, role: session.role };
        next();
    } catch (_) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }
};

const pageAdmin = (req, res, next) => {
    if (!req.user) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    if (req.user.role !== "admin") return res.status(403).render("404", { title: "403 | Access Denied" });
    next();
};

module.exports = { pageAuth, pageAdmin };

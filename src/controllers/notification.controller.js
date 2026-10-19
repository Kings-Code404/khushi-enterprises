const { getPool } = require("../db/connection");

const getMyNotifications = async (req, res) => {
    try {
        const pool = getPool();
        const [notifications] = await pool.query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC`,
            [req.user.user_id]
        );
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
};

const markAsRead = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query(
            `UPDATE notifications SET status = 'read' WHERE notification_id = ? AND user_id = ?`,
            [req.params.id, req.user.user_id]
        );
        return res.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update notification." });
    }
};

module.exports = { getMyNotifications, markAsRead };

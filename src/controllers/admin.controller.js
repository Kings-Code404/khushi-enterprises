const { getPool } = require("../db/connection");

const ok = (res, data = {}) => res.status(200).json({ success: true, ...data });
const fail = (res, message, status = 500) => res.status(status).json({ success: false, message });

const addAdminLog = async (adminId, action) => {
    try {
        const pool = getPool();
        if (adminId) await pool.query(`INSERT INTO admin_logs (admin_id, action) VALUES (?, ?)`, [adminId, action]);
    } catch (_) {}
};

const getDashboardStats = async (req, res) => {
    try {
        const pool = getPool();
        const [[users]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`);
        const [[products]] = await pool.query(`SELECT COUNT(*) AS totalProducts FROM products`);
        const [[orders]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
        const [[revenue]] = await pool.query(`SELECT IFNULL(SUM(total_amount),0) AS totalRevenue FROM orders WHERE order_status != 'cancelled'`);
        const [[messages]] = await pool.query(`SELECT COUNT(*) AS totalMessages FROM contacts`);
        const [[reviews]] = await pool.query(`SELECT COUNT(*) AS totalReviews FROM reviews`);
        return ok(res, { stats: { totalUsers: users.totalUsers, totalProducts: products.totalProducts, totalOrders: orders.totalOrders, totalRevenue: revenue.totalRevenue, totalMessages: messages.totalMessages, totalReviews: reviews.totalReviews } });
    } catch (error) {
        return fail(res, "Failed to load dashboard statistics.");
    }
};

const getRecentOrders = async (req, res) => {
    try {
        const pool = getPool();
        const [orders] = await pool.query(`SELECT o.order_id, o.total_amount, o.order_status, o.payment_status, o.created_at, u.name, u.email FROM orders o INNER JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC LIMIT 10`);
        return ok(res, { orders });
    } catch (error) {
        return fail(res, "Failed to fetch recent orders.");
    }
};

const getRecentUsers = async (req, res) => {
    try {
        const pool = getPool();
        const [users] = await pool.query(`SELECT user_id, name, email, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 10`);
        return ok(res, { users });
    } catch (error) {
        return fail(res, "Failed to fetch recent users.");
    }
};

const getAllUsers = async (req, res) => {
    try {
        const pool = getPool();
        const [users] = await pool.query(`SELECT user_id, name, email, phone, role, status, created_at FROM users ORDER BY user_id DESC`);
        return ok(res, { users });
    } catch (error) {
        return fail(res, "Failed to fetch users.");
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const pool = getPool();
        const { role, status } = req.body;
        if (Number(req.params.id) === Number(req.user.user_id) && (role === "user" || status === "blocked")) {
            return fail(res, "You cannot remove your own admin access or block your own account.", 400);
        }
        if (role && !["user", "admin"].includes(role)) return fail(res, "Invalid role.", 400);
        if (status && !["active", "blocked"].includes(status)) return fail(res, "Invalid status.", 400);
        await pool.query(`UPDATE users SET role = COALESCE(?, role), status = COALESCE(?, status) WHERE user_id = ?`, [role || null, status || null, req.params.id]);
        await addAdminLog(req.user?.user_id, `Updated user ${req.params.id}`);
        return ok(res, { message: "User updated successfully." });
    } catch (error) {
        return fail(res, "Failed to update user.");
    }
};

const deleteUser = async (req, res) => {
    try {
        const pool = getPool();
        if (Number(req.params.id) === Number(req.user.user_id)) return fail(res, "You cannot delete your own admin account.", 400);
        await pool.query(`DELETE FROM users WHERE user_id = ?`, [req.params.id]);
        await addAdminLog(req.user?.user_id, `Deleted user ${req.params.id}`);
        return ok(res, { message: "User deleted successfully." });
    } catch (error) {
        return fail(res, "Failed to delete user.");
    }
};

const getMessages = async (req, res) => {
    try {
        const pool = getPool();
        const [messages] = await pool.query(`SELECT * FROM contacts ORDER BY contact_id DESC`);
        return ok(res, { messages });
    } catch (error) {
        return fail(res, "Failed to fetch messages.");
    }
};

const updateMessageStatus = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query(`UPDATE contacts SET status = ? WHERE contact_id = ?`, [req.body.status || "read", req.params.id]);
        return ok(res, { message: "Message status updated." });
    } catch (error) {
        return fail(res, "Failed to update message.");
    }
};

const getReviews = async (req, res) => {
    try {
        const pool = getPool();
        const [reviews] = await pool.query(`SELECT r.*, u.name, p.product_name FROM reviews r INNER JOIN users u ON r.user_id = u.user_id INNER JOIN products p ON r.product_id = p.product_id ORDER BY r.review_id DESC`);
        return ok(res, { reviews });
    } catch (error) {
        return fail(res, "Failed to fetch reviews.");
    }
};

const updateReviewStatus = async (req, res) => {
    try {
        const pool = getPool();
        const safeStatus = ["pending", "approved", "rejected"].includes(req.body.status) ? req.body.status : "pending";
        await pool.query(`UPDATE reviews SET status = ? WHERE review_id = ?`, [safeStatus, req.params.id]);
        return ok(res, { message: "Review status updated." });
    } catch (error) {
        return fail(res, "Failed to update review.");
    }
};

const getCoupons = async (req, res) => {
    try {
        const pool = getPool();
        const [coupons] = await pool.query(`SELECT * FROM coupons ORDER BY coupon_id DESC`);
        return ok(res, { coupons });
    } catch (error) {
        return fail(res, "Failed to fetch coupons.");
    }
};

const createCoupon = async (req, res) => {
    try {
        const pool = getPool();
        const { code, discount_type, discount_value, expiry_date, status } = req.body;
        await pool.query(`INSERT INTO coupons (code, discount_type, discount_value, expiry_date, status) VALUES (?, ?, ?, ?, ?)`, [String(code || "").toUpperCase(), discount_type || "fixed", discount_value || 0, expiry_date || null, status || "active"]);
        await addAdminLog(req.user?.user_id, `Created coupon ${code}`);
        return res.status(201).json({ success: true, message: "Coupon created successfully." });
    } catch (error) {
        return fail(res, "Failed to create coupon.");
    }
};

const deleteCoupon = async (req, res) => {
    try {
        const pool = getPool();
        await pool.query(`DELETE FROM coupons WHERE coupon_id = ?`, [req.params.id]);
        return ok(res, { message: "Coupon deleted successfully." });
    } catch (error) {
        return fail(res, "Failed to delete coupon.");
    }
};

const getSubscribers = async (req, res) => {
    try {
        const pool = getPool();
        const [subscribers] = await pool.query(`SELECT * FROM newsletter_subscribers ORDER BY subscriber_id DESC`);
        return ok(res, { subscribers });
    } catch (error) {
        return fail(res, "Failed to fetch subscribers.");
    }
};

const getNotifications = async (req, res) => {
    try {
        const pool = getPool();
        const [notifications] = await pool.query(`SELECT n.*, u.name, u.email FROM notifications n INNER JOIN users u ON n.user_id = u.user_id ORDER BY n.notification_id DESC`);
        return ok(res, { notifications });
    } catch (error) {
        return fail(res, "Failed to fetch notifications.");
    }
};

const createNotification = async (req, res) => {
    try {
        const pool = getPool();
        const { user_id, title, message } = req.body;
        await pool.query(`INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`, [user_id, title, message]);
        return res.status(201).json({ success: true, message: "Notification created successfully." });
    } catch (error) {
        return fail(res, "Failed to create notification.");
    }
};

const getAdminLogs = async (req, res) => {
    try {
        const pool = getPool();
        const [logs] = await pool.query(`SELECT l.*, u.name AS admin_name FROM admin_logs l LEFT JOIN users u ON l.admin_id = u.user_id ORDER BY l.log_id DESC`);
        return ok(res, { logs });
    } catch (error) {
        return fail(res, "Failed to fetch admin logs.");
    }
};

const getPayments = async (req, res) => { try { const pool=getPool(); const [payments]=await pool.query(`SELECT p.*,u.name,u.email FROM payments p INNER JOIN orders o ON p.order_id=o.order_id INNER JOIN users u ON o.user_id=u.user_id ORDER BY p.payment_id DESC`); return ok(res,{payments}); } catch (_) { return fail(res,"Failed to fetch payments."); } };

const getReports = async (req, res) => {
    try {
        const pool = getPool();
        const [[users]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users`);
        const [[products]] = await pool.query(`SELECT COUNT(*) AS totalProducts FROM products`);
        const [[sales]] = await pool.query(`SELECT COUNT(*) AS orders, IFNULL(SUM(total_amount),0) AS revenue FROM orders WHERE order_status != 'cancelled'`);
        const [topProducts] = await pool.query(`SELECT p.product_name, SUM(oi.quantity) AS sold FROM order_items oi INNER JOIN products p ON oi.product_id = p.product_id GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5`);
        return ok(res, { users, products, sales, topProducts });
    } catch (error) {
        return fail(res, "Failed to generate reports.");
    }
};

module.exports = {
    getDashboardStats,
    getRecentOrders,
    getRecentUsers,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getMessages,
    updateMessageStatus,
    getReviews,
    updateReviewStatus,
    getCoupons,
    createCoupon,
    deleteCoupon,
    getSubscribers,
    getNotifications,
    createNotification,
    getAdminLogs,
    getPayments,
    getReports
};

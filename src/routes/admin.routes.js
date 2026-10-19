const express = require("express");
const admin = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/dashboard", admin.getDashboardStats);
router.get("/orders/recent", admin.getRecentOrders);
router.get("/users/recent", admin.getRecentUsers);
router.get("/users", admin.getAllUsers);
router.put("/users/:id", admin.updateUserStatus);
router.delete("/users/:id", admin.deleteUser);

router.get("/contact-messages", admin.getMessages);
router.put("/contact-messages/:id", admin.updateMessageStatus);
router.get("/reviews", admin.getReviews);
router.put("/reviews/:id/status", admin.updateReviewStatus);
router.get("/coupons", admin.getCoupons);
router.post("/coupons", admin.createCoupon);
router.delete("/coupons/:id", admin.deleteCoupon);
router.get("/newsletter", admin.getSubscribers);
router.get("/notifications", admin.getNotifications);
router.post("/notifications", admin.createNotification);
router.get("/logs", admin.getAdminLogs);
router.get("/payments", admin.getPayments);
router.get("/reports", admin.getReports);

module.exports = router;

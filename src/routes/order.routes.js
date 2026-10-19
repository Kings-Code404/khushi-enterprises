const express = require("express");

const {
    placeOrder,
    trackOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

// Public tracking route
router.get("/track/:id", trackOrder);

// Admin routes must be before dynamic /:id route
router.get("/admin/all", authMiddleware, adminMiddleware, getAllOrders);
router.put("/admin/:id", authMiddleware, adminMiddleware, updateOrderStatus);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteOrder);

// User routes
router.post("/", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderDetails);

module.exports = router;

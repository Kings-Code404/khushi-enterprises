const express = require("express");

const {
    sendMessage,
    getAllMessages,
    getMessageById,
    deleteMessage,
    getTotalMessages
} = require("../controllers/contact.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

// Public Route
router.post("/", sendMessage);

// Admin Routes
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllMessages
);

router.get(
    "/total",
    authMiddleware,
    adminMiddleware,
    getTotalMessages
);

router.get(
    "/:id",
    authMiddleware,
    adminMiddleware,
    getMessageById
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteMessage
);

module.exports = router;
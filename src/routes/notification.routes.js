const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const { getMyNotifications, markAsRead } = require("../controllers/notification.controller");
const router = express.Router();
router.use(authMiddleware);
router.get("/", getMyNotifications);
router.put("/:id/read", markAsRead);
module.exports = router;

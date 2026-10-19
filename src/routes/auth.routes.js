const express = require("express");
const {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { rateLimit } = require("../middlewares/rateLimit.middleware");

const router = express.Router();

// Register
router.post("/register", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), register);

// Login
router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 10, key: (req) => `${req.ip}:${String(req.body?.email || "").toLowerCase()}` }), login);

// Logout
router.post("/logout", logout);

// Password Recovery
router.post("/forgot-password", rateLimit({ windowMs: 60 * 60 * 1000, max: 5, key: (req) => `${req.ip}:${String(req.body?.email || "").toLowerCase()}` }), forgotPassword);
router.post("/reset-password", resetPassword);

// Profile
router.get("/profile", authMiddleware, getProfile);
router.put("/update-profile", authMiddleware, updateProfile);

module.exports = router;

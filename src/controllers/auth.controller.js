const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { getPool } = require("../db/connection");
const sendEmail = require("../utils/sendEmail");
const { passwordError } = require("../utils/validation");

// Register User
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled."
            });
        }
        const passwordValidationError = passwordError(password);
        if (passwordValidationError) return res.status(400).json({ success: false, message: passwordValidationError });

        const normalizedEmail = String(email).trim().toLowerCase();
        const existingUser = await User.findByEmail(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.createUser(
            name.trim(),
            normalizedEmail,
            hashedPassword,
            phone
        );

        if (address && result.insertId) {
            await User.updateUser(result.insertId, name, phone, address);
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });
        }

        const user = await User.findByEmail(String(email).trim().toLowerCase());

        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials." });

        if (user.status !== "active") {
            return res.status(403).json({ success: false, message: "Your account is blocked or inactive." });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });
        }

        const token = generateToken(user);

        const pool = getPool();
        await pool.query(
            `INSERT INTO sessions (session_id, user_id, ip_address, user_agent, expires_at, status)
             VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 'active')`,
            [token.slice(0, 255), user.user_id, req.ip, req.headers["user-agent"] || null]
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};

// Logout User
const logout = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (token) {
            const pool = getPool();
            await pool.query(`UPDATE sessions SET status = 'logout' WHERE session_id = ?`, [token.slice(0, 255)]);
        }
    } catch (_) {}

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

// User Profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id || req.user.id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found in token."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile."
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id || req.user.id;

        const {
            name,
            phone,
            address
        } = req.body;

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        await User.updateUser(
            userId,
            name || existingUser.name,
            phone ?? existingUser.phone,
            address ?? existingUser.address
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile."
        });
    }
};


const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        if (!email) return res.status(400).json({ success: false, message: "Email is required." });

        const user = await User.findByEmail(email);
        if (!user) return res.status(200).json({ success: true, message: "If the email is registered, reset instructions have been generated." });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
        const pool = getPool();
        await pool.query(`UPDATE password_reset_tokens SET used_status = 'used' WHERE user_id = ? AND used_status = 'unused'`, [user.user_id]);
        await pool.query(
            `INSERT INTO password_reset_tokens (user_id, reset_token, expires_at, used_status)
             VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'unused')`,
            [user.user_id, tokenHash]
        );

        const resetUrl = `${process.env.RESET_BASE_URL || "http://localhost:5000"}/set-new-password?token=${encodeURIComponent(resetToken)}`;
        const mailSent = await sendEmail(
            email,
            "Khushi Enterprises Password Reset",
            `<p>You requested a password reset.</p><p>This link expires in 15 minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
        );

        return res.status(200).json({
            success: true,
            message: "If the email is registered, reset instructions have been generated.",
            ...(process.env.NODE_ENV !== "production" && !mailSent ? { resetToken } : {})
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to process password reset request." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { reset_token, password } = req.body;
        if (!reset_token || !password) {
            return res.status(400).json({ success: false, message: "Reset token and new password are required." });
        }
        const passwordValidationError = passwordError(password);
        if (passwordValidationError) return res.status(400).json({ success: false, message: passwordValidationError });

        const tokenHash = crypto.createHash("sha256").update(reset_token).digest("hex");

        const pool = getPool();
        const [tokens] = await pool.query(
            `SELECT * FROM password_reset_tokens
             WHERE reset_token = ? AND used_status = 'unused' AND expires_at >= NOW()
             LIMIT 1`,
            [tokenHash]
        );

        if (!tokens.length) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(`UPDATE users SET password = ? WHERE user_id = ?`, [hashedPassword, tokens[0].user_id]);
        await pool.query(`UPDATE password_reset_tokens SET used_status = 'used' WHERE token_id = ?`, [tokens[0].token_id]);
        await pool.query(`UPDATE sessions SET status = 'expired' WHERE user_id = ?`, [tokens[0].user_id]);

        return res.status(200).json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to reset password." });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};

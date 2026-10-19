const express = require("express");
const auth = require("../middlewares/auth.middleware");
const { rateLimit } = require("../middlewares/rateLimit.middleware");
const { createRazorpayOrder, verifyPayment, cancelPayment, getPaymentByOrder } = require("../controllers/payment.controller");

const router = express.Router();
router.post("/razorpay/order", auth, rateLimit({ windowMs: 10 * 60 * 1000, max: 8, key: (req) => `razorpay-order:${req.user?.user_id || req.ip}` }), createRazorpayOrder);
router.post("/razorpay/verify", auth, rateLimit({ windowMs: 10 * 60 * 1000, max: 12, key: (req) => `razorpay-verify:${req.user?.user_id || req.ip}` }), verifyPayment);
router.post("/razorpay/:orderId/cancel", auth, cancelPayment);
router.get("/:orderId", auth, getPaymentByOrder);
module.exports = router;

const express = require("express");
const { validateCoupon } = require("../controllers/coupon.controller");
const router = express.Router();
router.get("/validate/:code", validateCoupon);
router.post("/validate", validateCoupon);
module.exports = router;

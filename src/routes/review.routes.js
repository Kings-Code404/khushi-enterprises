const express = require("express");

const {
    addReview,
    getProductReviews,
    deleteReview
} = require("../controllers/review.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Get Product Reviews
router.get(
    "/:productId",
    getProductReviews
);

/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

// Add Review
router.post(
    "/",
    authMiddleware,
    addReview
);

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

// Delete Review
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteReview
);

module.exports = router;
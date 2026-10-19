const Review = require("../models/review.model");

// Add Review
const addReview = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            product_id,
            rating,
            review
        } = req.body;

        if (!product_id || !rating || !review || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        if (!(await Review.hasPurchased(userId, product_id))) {
            return res.status(403).json({ success: false, message: "Only customers who purchased this product can review it." });
        }

        await Review.addReview(
            userId,
            product_id,
            rating,
            review
        );

        return res.status(201).json({
            success: true,
            message: "Review added successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add review."
        });
    }
};

// Get Product Reviews
const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;

        const reviews = await Review.getProductReviews(productId);

        return res.status(200).json({
            success: true,
            reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews."
        });
    }
};

// Delete Review
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;

        await Review.deleteReview(reviewId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete review."
        });
    }
};

module.exports = {
    addReview,
    getProductReviews,
    deleteReview
};
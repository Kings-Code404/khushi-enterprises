const express = require("express");

const {
    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
    clearCart
} = require("../controllers/cart.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// All Cart Routes Require Login

// Add Product To Cart
router.post(
    "/",
    authMiddleware,
    addToCart
);

// Get User Cart
router.get(
    "/",
    authMiddleware,
    getCart
);

// Update Cart Quantity
router.put(
    "/:id",
    authMiddleware,
    updateCartQuantity
);

// Remove Cart Item
router.delete(
    "/:id",
    authMiddleware,
    removeCartItem
);

// Clear Cart
router.delete(
    "/clear/all",
    authMiddleware,
    clearCart
);

module.exports = router;
const Cart = require("../models/cart.model");
const { positiveInteger } = require("../utils/validation");

// Add To Cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const {
            product_id,
            quantity
        } = req.body;

        const safeProductId = positiveInteger(product_id);
        const safeQuantity = positiveInteger(quantity) || 1;
        if (!safeProductId) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required."
            });
        }

        await Cart.addToCart(
            userId,
            safeProductId,
            safeQuantity
        );

        return res.status(201).json({
            success: true,
            message: "Product added to cart."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart."
        });
    }
};

// Get Cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const cartItems = await Cart.getUserCart(userId);
        const cartTotal = await Cart.getCartTotal(userId);

        return res.status(200).json({
            success: true,
            cartItems,
            total: cartTotal.total || 0
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart."
        });
    }
};

// Update Cart Quantity
const updateCartQuantity = async (req, res) => {
    try {
        const cartId = req.params.id;

        const {
            quantity
        } = req.body;

        const safeQuantity = positiveInteger(quantity);
        if (!safeQuantity) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1."
            });
        }

        const result = await Cart.updateQuantity(
            req.user.user_id,
            cartId,
            safeQuantity
        );
        if (!result.affectedRows) return res.status(400).json({ success: false, message: "Cart item not found or quantity exceeds stock." });

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update cart."
        });
    }
};

// Remove Cart Item
const removeCartItem = async (req, res) => {
    try {
        const cartId = req.params.id;

        await Cart.removeItem(req.user.user_id, cartId);

        return res.status(200).json({
            success: true,
            message: "Item removed from cart."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to remove cart item."
        });
    }
};

// Clear Cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user.user_id;

        await Cart.clearCart(userId);

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clear cart."
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
    clearCart
};

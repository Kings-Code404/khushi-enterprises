const Order = require("../models/order.model");

// Place Order / Checkout
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const {
            payment_method,
            first_name,
            last_name,
            phone,
            email,
            country,
            state,
            city,
            zip_code,
            zip,
            street_address,
            address
        } = req.body;

        const normalizedPaymentMethod = String(payment_method || "COD").toUpperCase();
        if (normalizedPaymentMethod !== "COD") return res.status(400).json({ success: false, message: "Online payments are not configured. Please select Cash on Delivery." });

        const orderId = await Order.createCheckout(
            userId,
            normalizedPaymentMethod,
            {
                first_name,
                last_name,
                phone,
                email,
                country,
                state,
                city,
                zip_code: zip_code || zip,
                street_address: street_address || address
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            orderId
        });

    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.status ? error.message : "Failed to place order."
        });
    }
};


// Public Order Tracking by Order ID and Billing Email
const trackOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const email = req.query.email || req.body?.email || "";

        const order = await Order.getOrderByIdAndEmail(orderId, email);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const items = await Order.getOrderDetails(orderId);

        return res.status(200).json({
            success: true,
            order,
            items
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to track order."
        });
    }
};

// User Order History
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const orders = await Order.getUserOrders(userId);

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders."
        });
    }
};

// Order Details
const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.getOrderByIdForUser(orderId, req.user.user_id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        const items = await Order.getOrderDetails(orderId);

        return res.status(200).json({
            success: true,
            order,
            items
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order details."
        });
    }
};

// Admin Get All Orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders."
        });
    }
};

// Admin Update Status
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        if (!["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid order status." });
        }

        await Order.updateOrderStatus(
            orderId,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Order status updated."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update status."
        });
    }
};

// Delete Order
const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        await Order.deleteOrder(orderId);

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete order."
        });
    }
};

module.exports = {
    placeOrder,
    trackOrder,
    getMyOrders,
    getOrderDetails,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
};

const Contact = require("../models/contact.model");

// Send Contact Message
const sendMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            subject,
            message
        } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email and message are required."
            });
        }

        await Contact.createContact(
            name,
            email,
            subject || "General Inquiry",
            message,
            phone || null
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to send message."
        });
    }
};

// Admin Get All Messages
const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.getAllContacts();

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages."
        });
    }
};

// Admin Get Single Message
const getMessageById = async (req, res) => {
    try {
        const message = await Contact.getContactById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found."
            });
        }

        return res.status(200).json({
            success: true,
            message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch message."
        });
    }
};

// Admin Delete Message
const deleteMessage = async (req, res) => {
    try {
        await Contact.deleteContact(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete message."
        });
    }
};

// Admin Total Messages
const getTotalMessages = async (req, res) => {
    try {
        const total = await Contact.getTotalMessages();

        return res.status(200).json({
            success: true,
            totalMessages: total.totalMessages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch total messages."
        });
    }
};

module.exports = {
    sendMessage,
    getAllMessages,
    getMessageById,
    deleteMessage,
    getTotalMessages
};
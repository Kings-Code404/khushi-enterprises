const { getPool } = require("../db/connection");

class Contact {

    // Save Contact Message
    static async createContact(
        name,
        email,
        subject,
        message,
        phone = null
    ) {
        const pool = getPool();

        const [result] = await pool.query(
            `INSERT INTO contacts
            (
                name,
                email,
                phone,
                subject,
                message,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'new')`,
            [
                name,
                email,
                phone,
                subject,
                message
            ]
        );

        return result;
    }

    // Get All Messages
    static async getAllContacts() {
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT *
             FROM contacts
             ORDER BY contact_id DESC`
        );

        return rows;
    }

    // Get Single Message
    static async getContactById(contactId) {
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT *
             FROM contacts
             WHERE contact_id = ?`,
            [contactId]
        );

        return rows[0];
    }

    // Delete Message
    static async deleteContact(contactId) {
        const pool = getPool();

        const [result] = await pool.query(
            `DELETE FROM contacts
             WHERE contact_id = ?`,
            [contactId]
        );

        return result;
    }

    // Count Messages
    static async getTotalMessages() {
        const pool = getPool();

        const [rows] = await pool.query(
            `SELECT COUNT(*) AS totalMessages
             FROM contacts`
        );

        return rows[0];
    }
}

module.exports = Contact;
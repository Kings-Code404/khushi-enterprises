const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
        return true;
    } catch (error) {
        console.error("Email delivery failed:", error.message);
        return false;
    }
};
module.exports = sendEmail;

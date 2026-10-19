const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const { verifyPaymentSignature, verifyWebhookSignature } = require("../src/services/razorpay.service");

const original = { ...process.env };
process.env.RAZORPAY_KEY_SECRET = "test_payment_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret";

test("accepts a valid Razorpay payment HMAC", () => {
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update("order_test|pay_test").digest("hex");
    assert.equal(verifyPaymentSignature("order_test", "pay_test", signature), true);
});

test("rejects an invalid Razorpay payment HMAC", () => {
    assert.equal(verifyPaymentSignature("order_test", "pay_test", "0".repeat(64)), false);
});

test("accepts and rejects webhook signatures using the raw request body", () => {
    const body = Buffer.from('{"event":"payment.captured"}');
    const signature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
    assert.equal(verifyWebhookSignature(body, signature), true);
    assert.equal(verifyWebhookSignature(body, "wrong"), false);
});

test.after(() => Object.assign(process.env, original));

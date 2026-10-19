-- Run once against an existing database after a verified backup. It does not drop data.
ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(100) NULL;
ALTER TABLE orders ADD UNIQUE KEY unique_orders_user_idempotency (user_id, idempotency_key);
ALTER TABLE payments ADD COLUMN gateway_order_id VARCHAR(100) NULL UNIQUE;
ALTER TABLE payments ADD COLUMN gateway_payment_id VARCHAR(100) NULL UNIQUE;
ALTER TABLE payments ADD COLUMN gateway_amount INT NULL;
ALTER TABLE payments ADD COLUMN gateway_currency CHAR(3) NULL;
ALTER TABLE payments MODIFY payment_status ENUM('pending','initiated','success','failed','refunded') DEFAULT 'pending';
CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
    event_id VARCHAR(128) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    processing_status ENUM('received','processed','failed') DEFAULT 'received',
    processed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

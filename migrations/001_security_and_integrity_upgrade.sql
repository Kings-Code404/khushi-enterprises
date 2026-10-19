-- Run once after taking a verified database backup. This migration is non-destructive.
-- Existing reset tokens cannot be converted to hashes. Expire outstanding reset links first.
UPDATE password_reset_tokens SET used_status = 'used' WHERE used_status = 'unused';

-- Helpful indexes for authentication/session lookups and public order tracking.
CREATE INDEX idx_sessions_user_status ON sessions (user_id, status);
CREATE INDEX idx_orders_tracking ON orders (tracking_number);

-- Password-reset tokens created by the repaired application are SHA-256 hashes, not raw tokens.

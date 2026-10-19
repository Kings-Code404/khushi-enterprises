# Razorpay Integration

## Added endpoints

| Endpoint | Purpose |
| --- | --- |
| `POST /api/payments/razorpay/order` | Authenticated, idempotent internal-order and Razorpay-order creation. Computes cart total server-side. |
| `POST /api/payments/razorpay/verify` | Authenticated checkout callback verification using HMAC, gateway payment fetch, expected order ID, INR and paise amount. |
| `POST /api/payments/razorpay/:orderId/cancel` | Authenticated cancellation/failure path that releases stock exactly once. |
| `POST /api/payments/razorpay/webhook` | Raw-body HMAC-verified webhook receiver with database event de-duplication. |

## Flow

1. Checkout validates billing fields and requests an authenticated server order with an idempotency key.
2. The server locks cart/product rows, calculates the trusted total, reserves stock in a transaction, creates a pending internal payment record, and creates an INR Razorpay order in paise.
3. Razorpay Standard Checkout receives only the public Key ID, gateway order ID, amount and currency.
4. The browser sends the gateway callback fields to the verification endpoint. The server verifies HMAC using its Key Secret, fetches the payment from Razorpay, and requires a captured payment with the expected order ID, amount and currency before confirming the internal order.
5. The webhook independently verifies the raw-body signature and processes each event ID once.

## Required environment variables

```text
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Use Test Mode keys first. The key secret and webhook secret are never returned by an API or sent to the browser.

## Verified tests

`npm test` passes six local tests: password/configuration validation, valid and invalid payment signatures, and valid and invalid webhook signatures. Database, real Razorpay Test Mode, webhook delivery, payment capture and browser flow tests remain unexecuted because no database or Razorpay test credentials were supplied.

## Deployment checks

- Apply `migrations/002_razorpay_payment_upgrade.sql` after a database backup.
- Enable automatic capture as appropriate in Razorpay and configure the signed Test Mode webhook endpoint.
- Use a public HTTPS URL for deployed webhook delivery. Do not use a local endpoint without a secure tunnel.
- Resolve the dependency-audit findings before a production release; the latest install reported 14 findings in transitive dependencies.

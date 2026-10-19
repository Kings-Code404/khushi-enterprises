
## Khushi Enterprises setup

1. Copy `.env.example` to `.env` and set strong, unique `JWT_SECRET`, `SESSION_SECRET`, database credentials, and the initial admin password.
2. Create a MySQL database user with only the privileges needed for this application. Do not use a production root account.
3. For an existing database, take a backup and run `migrations/001_security_and_integrity_upgrade.sql` once. Do not run `src/db/database.sql` against an existing database: it is a destructive development reset script.
4. Install dependencies with `npm ci`, then run `npm test` and `npm run start:prod`.

## Razorpay test-mode setup

1. In the Razorpay Dashboard, switch to Test Mode and generate API keys.
2. Put the test Key ID, Key Secret and a separate webhook secret in `.env` as `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET`. Never put the secret in frontend files.
3. Run the non-destructive `migrations/002_razorpay_payment_upgrade.sql` after a backup when upgrading an existing database.
4. Start the site with HTTPS (or a local test server), select **Razorpay Secure Checkout** at checkout, and use the Razorpay test checkout. No card data is collected by this application.
5. Configure `https://your-host/api/payments/razorpay/webhook` in Razorpay Test Mode for payment success and failure events. A public HTTPS tunnel is needed for local webhook testing.

Razorpay orders use trusted server-side cart pricing in paise. Successful browser callbacks are signature-checked and then checked against the gateway's captured amount, currency and order ID; webhooks provide a second, idempotent status path.

## Render deployment

This repository includes a `render.yaml` Blueprint. Push it to GitHub, then choose **New → Blueprint** in Render. Render supplies `PORT`; production starts with `npm start`, listens on `0.0.0.0`, and exposes `/healthz` for health checks. The application needs an external MySQL database; see `docs/RENDER_DEPLOYMENT.md` for required environment variables, migrations, and free-tier spin-down behavior.

## Image Audit Implementation

This project includes a local image asset structure under `public/assets/images/`. External placeholder image URLs have been replaced with local files so the website can run consistently offline and match the synopsis image audit requirements.

For production, replace generated placeholder assets with real beanbag product images while keeping SEO-friendly filenames such as `classic-brown-large-beanbag.webp`, `gaming-red-xl-beanbag.webp`, and `premium-black-xl-beanbag.webp`.

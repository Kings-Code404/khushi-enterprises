# Khushi Enterprises Compliance and Security Audit

## Scope and evidence

The supplied project report defines a Node.js, Express, EJS and MySQL online beanbag store. The supplied source archive implements this stack with public, customer and administrator pages. This audit is based on static source review and the automated checks recorded in `TEST_REPORT.md`; no MySQL service, email credentials, payment gateway or browser session was supplied.

## Architecture inventory

| Area | Verified implementation |
| --- | --- |
| Entry point | `src/index.js` connects MySQL, creates missing tables, seeds development records and starts Express. |
| Rendering | EJS templates in `src/views`; browser behaviour in `public/js/pages`; static assets in `public`. |
| API | Express route modules under `src/routes`; controllers use mysql2 prepared statements. |
| Authentication | bcryptjs passwords, JWT in an HttpOnly cookie, plus database-backed session records. |
| Data | MySQL tables for users, categories, products, cart, wishlist, addresses, orders, order items, payments, reviews, contacts, newsletter subscribers, logs, notifications and blogs. |
| Administration | Protected dashboard, products, categories, orders, users, messages, reports, payments, coupons, reviews, inventory, blogs, newsletter, notifications, logs and settings pages. |

## Report compliance matrix

| Requirement from report | Status | Evidence / outcome |
| --- | --- | --- |
| User registration, login, logout and profiles | Partially implemented | Implemented with bcrypt, JWT, session records and protected profile APIs. Email verification is not implemented. |
| Password reset | Implemented correctly | Random reset token is emailed; only its SHA-256 hash is persisted; tokens expire and active sessions are invalidated on reset. |
| Product and category management | Implemented correctly | Public browse/search/category APIs and admin CRUD are present. Product removal is now a soft delete to protect order history. |
| Cart and wishlist | Implemented correctly | Ownership checks are applied; cart changes validate stock. |
| Checkout and order processing | Implemented correctly | Repaired: one transaction locks cart/product rows, calculates server-side prices, validates stock, saves item snapshots, decrements stock and clears cart atomically. |
| Payment management | Partially implemented | COD records work. Online payment creation/verification now returns a safe unavailable response until a gateway and signed webhook are provided. |
| Inventory monitoring | Partially implemented | Stock is stored, surfaced in products and adjusted transactionally. Low-stock thresholds/history are not implemented. |
| Search and filtering | Partially implemented | Keyword search and category endpoint exist. The product UI does not provide documented multi-attribute filtering, sorting or pagination. |
| Order tracking | Implemented correctly | Public tracking now requires both order ID and the matching email; the prior empty-email lookup risk is removed. |
| Reviews | Partially implemented | Moderation and purchaser check exist. Duplicate-review prevention is not verifiable from the schema. |
| Contacts, newsletter, reports and admin operations | Partially implemented | Routes/controllers/pages exist. Their end-to-end database behaviour is untested without MySQL. |
| Responsive UI and accessibility | Partially implemented | Responsive assets/pages are present; a full browser and screen-reader audit was not possible. |
| Security mechanisms in report | Partially implemented | Password hashing, prepared SQL, protected roles, server sessions, Helmet, upload limits, request size limits, rate limits and safe errors are present. A nonce-based CSP and distributed rate limiter remain future work. |

## Findings and repairs

| Severity | Finding | Repair |
| --- | --- | --- |
| Critical | Checkout wrote orders, items, stock and cart in independent operations. Failures could create partial orders or oversell. | Replaced with `Order.createCheckout`, a locked MySQL transaction. |
| Critical | A customer could submit `status: success` to the payment verification API. | Browser-side online-payment verification is disabled with HTTP 501 until a gateway webhook is implemented. |
| High | Raw password-reset tokens were stored in MySQL. | Store SHA-256 token hashes, expire outstanding old links via migration, and invalidate active sessions after reset. |
| High | Protected page routes verified a JWT but not its server-side session or account state. | Page middleware now checks the session row, expiry, active user state and current role. |
| Medium | Login disclosed whether an account existed. | Unknown users and bad passwords now return the same invalid-credentials response. |
| Medium | No abuse control protected registration, login or password reset. | Added in-process request limits. Use Redis or another shared store before multi-instance production deployment. |
| Medium | Deleting a product could cascade through order history. | Product deletion now marks it inactive. |
| Medium | Unknown API paths returned an HTML page and errors could expose inconsistent responses. | Added centralized API-aware 404 and error middleware. |

## Remaining production work

- Configure a real payment gateway with server-side order creation, signature verification and webhook replay protection.
- Move rate-limit state to Redis for multiple server instances.
- Refactor inline scripts/styles before enabling a strict nonce-based Content Security Policy.
- Run the migration, startup and full customer/admin flow suite against a disposable MySQL test database.
- Add email verification, multi-attribute product filtering/pagination, and an explicit duplicate-review rule if required by the final academic specification.

# Deployment Guide

Use Node.js 20 LTS or later and MySQL 8 or later. Configure HTTPS at the reverse proxy and set `NODE_ENV=production`. Set the database credentials, strong unique JWT and session secrets, SMTP credentials, `FRONTEND_ORIGIN`, `RESET_BASE_URL`, and a non-placeholder initial admin password in the environment. Never commit `.env`.

Before deploying an existing database, take a tested backup, run `migrations/001_security_and_integrity_upgrade.sql`, and confirm the application database account has only the required privileges. Do not execute `src/db/database.sql` in production because it drops all project tables.

Run `npm ci`, `npm test`, then `npm run start:prod`. Monitor application errors without logging passwords, tokens, payment details, or full request bodies. Keep TLS termination, database backups, dependency updates, and a shared production rate-limit store under operational control.

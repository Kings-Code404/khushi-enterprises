# Route to Page and Data Map

## Pages

| URL | Page/template | Access | Primary API/data |
| --- | --- | --- | --- |
| `/` | `home.ejs` | Public | Latest products |
| `/products`, `/product/:id` | Product views | Public | Products, categories, reviews |
| `/about`, `/contact`, `/faqs`, `/blog`, `/blog-details` | Informational views | Public | Contact submission where applicable |
| `/track-order` | `track-order.ejs` | Public | Order ID plus matching email |
| `/login`, `/register`, `/forgot-password`, `/verify-code`, `/set-new-password` | Authentication views | Public | Auth API |
| `/cart`, `/wishlist`, `/checkout` | Shopping views | Authenticated | Cart, wishlist, order APIs |
| `/profile`, `/profile/edit`, `/complete-profile` | Customer views | Authenticated | Profile API |
| `/orders`, `/order/:id`, `/order-status/:id`, `/order-completed/:id` | Order views | Authenticated | Owned-order API |
| `/admin/*` | Admin EJS templates | Admin session | Admin, product, category, order and payment APIs |

## API route modules

| Base URL | Functions | Controller/data dependencies |
| --- | --- | --- |
| `/api/auth` | register, login, logout, profile, password reset | users, sessions, password_reset_tokens |
| `/api/products` | list, latest, search, category, detail, admin product CRUD | products, categories, uploads |
| `/api/categories` | list and admin CRUD | categories |
| `/api/cart`, `/api/wishlist` | customer cart and wish list operations | cart/wishlist, products |
| `/api/orders` | checkout, tracking, customer orders, admin status/delete | orders, order_items, addresses, payments, cart, products |
| `/api/payments` | owned payment lookup and admin status update | payments, orders |
| `/api/reviews`, `/api/contact`, `/api/newsletter`, `/api/coupons`, `/api/notifications` | respective customer/public flows | corresponding tables |
| `/api/admin` | statistics, users, messages, reviews, coupons, reports, payments and logs | all administration tables |

All SQL reviewed uses parameter placeholders. Administrative APIs are guarded by both authentication and role middleware.

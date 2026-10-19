const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");

const adminRoutes = require("./routes/admin.routes");
const contactRoutes = require("./routes/contact.routes");
const categoryRoutes = require("./routes/category.routes");
const reviewRoutes = require("./routes/review.routes");
const couponRoutes = require("./routes/coupon.routes");
const notificationRoutes = require("./routes/notification.routes");
const newsletterRoutes = require("./routes/newsletter.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const { processRazorpayWebhook } = require("./controllers/payment.controller");
const { pageAuth, pageAdmin } = require("./middlewares/pageAuth.middleware");
const csrfOrigin = require("./middlewares/csrfOrigin.middleware");
const { notFound, errorHandler } = require("./middlewares/error.middleware");



const app = express();

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

// Lightweight process health check for Render. It deliberately avoids a database query.
app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));

// Security Middleware
app.use(helmet({
    // Templates currently contain inline styles/scripts; a strict CSP needs a nonce refactor first.
    contentSecurityPolicy: false
}));

// Common Middleware
const allowedOrigin = process.env.FRONTEND_ORIGIN;
if (allowedOrigin) {
    app.use(cors({ origin: allowedOrigin, credentials: true }));
}
app.use(morgan("dev"));
// Razorpay signs the exact raw body; this route must be registered before JSON parsing.
app.post("/api/payments/razorpay/webhook", express.raw({ type: "application/json", limit: "100kb" }), processRazorpayWebhook);
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use(csrfOrigin);

// Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || "development-only-session-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Static Files
app.use(express.static(path.join(__dirname, "../public")));

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/wishlist", wishlistRoutes);


app.get("/products", (req, res) => {
    res.render("products", {
        title: "Products | Khushi Enterprises"
    });
});

app.get("/product/:id", (req, res) => {
    res.render("product-details", {
        title: "Product Details | Khushi Enterprises"
    });
});

app.get("/cart", pageAuth, (req, res) => {
    res.render("cart", {
        title: "Cart | Khushi Enterprises"
    });
});

app.get("/checkout", pageAuth, (req, res) => {
    res.render("checkout", {
        title: "Checkout | Khushi Enterprises"
    });
});

app.get("/orders", pageAuth, (req, res) => {
    res.render("orders", {
        title: "My Orders | Khushi Enterprises"
    });
});

app.get("/order/:id", pageAuth, (req, res) => {
    res.render("order-details", {
        title: "Order Details | Khushi Enterprises"
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        title: "Login | Khushi Enterprises"
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        title: "Register | Khushi Enterprises"
    });
});

app.get("/contact", (req, res) => {
    res.render("contact", {
        title: "Contact | Khushi Enterprises"
    });
});

app.get("/admin/dashboard", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/dashboard", {
        title: "Admin Dashboard"
    });
});

app.get("/admin/products", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/products", {
        title: "Manage Products"
    });
});

app.get("/admin/products/add", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/add-product", {
        title: "Add Product"
    });
});

app.get("/admin/products/edit/:id", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/edit-product", {
        title: "Edit Product"
    });
});

app.get("/profile/edit", pageAuth, (req, res) => {
    res.render("edit-profile", {
        title: "Edit Profile"
    });
});

app.get("/edit-profile", (req, res) => {
    res.redirect("/profile/edit");
});

app.get("/admin/users", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/users", {
        title: "Manage Users"
    });
});

app.get("/admin/orders", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/orders", {
        title: "Manage Orders"
    });
});

app.get("/admin/messages", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/messages", {
        title: "Contact Messages"
    });
});

app.get("/admin/reports", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/reports", {
        title: "Reports"
    });
});

app.get("/admin/settings", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/settings", {
        title: "Settings"
    });
});

app.get("/order-completed/:id", pageAuth, (req, res) => {
    res.render("order-completed", {
        title: "Order Completed"
    });
});

app.get("/wishlist", pageAuth, (req, res) => {
    res.render("wishlist", {
        title: "Wishlist"
    });
});

app.get("/track-order", (req, res) => {
    res.render("track-order", {
        title: "Track Your Order"
    });
});

app.get("/order-status/:id", pageAuth, (req, res) => {
    res.render("order-status", {
        title: "Order Status"
    });
});

app.get("/faqs", (req, res) => {
    res.render("faqs", {
        title: "FAQs"
    });
});

app.get("/about", (req, res) => {
    res.render("about", {
        title: "About Us"
    });
});

app.get("/blog", (req, res) => {
    res.render("blog", {
        title: "Our Blog"
    });
});

app.get("/blog-details", (req, res) => {
    res.render("blog-details", {
        title: "Blog Details"
    });
});

app.get("/profile", pageAuth, (req, res) => {
    res.render("profile", {
        title: "My Account"
    });
});



app.get("/coming-soon", (req, res) => {
    res.render("coming-soon", {
        title: "Coming Soon"
    });
});

app.get("/complete-profile", pageAuth, (req, res) => {
    res.render("complete-profile", {
        title: "Complete Profile"
    });
});

app.get("/forgot-password", (req, res) => {
    res.render("forgot-password", {
        title: "Forgot Password"
    });
});

app.get("/verify-code", (req, res) => {
    res.render("verify-code", {
        title: "Verify Code"
    });
});

app.get("/set-new-password", (req, res) => {
    res.render("set-new-password", {
        title: "Set New Password"
    });
});


app.get("/privacy-policy", (req, res) => {
    res.render("privacy-policy", { title: "Privacy Policy" });
});

app.get("/terms-and-conditions", (req, res) => {
    res.render("terms-and-conditions", { title: "Terms and Conditions" });
});

app.get("/reset-password", (req, res) => {
    res.redirect("/set-new-password");
});


app.get("/admin/categories", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/categories", { title: "Category Management" });
});

app.get("/admin/reviews", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/reviews", { title: "Review Management" });
});

app.get("/admin/inventory", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/inventory", { title: "Inventory Monitoring" });
});

app.get("/admin/payments", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/payments", { title: "Payment Manager" });
});

app.get("/admin/blogs", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/blogs", { title: "Blog Management" });
});

app.get("/admin/coupons", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/coupons", { title: "Coupon Management" });
});

app.get("/admin/newsletter", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/newsletter", { title: "Newsletter Management" });
});

app.get("/admin/notifications", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/notifications", { title: "Notification Management" });
});

app.get("/admin/logs", pageAuth, pageAdmin, (req, res) => {
    res.render("admin/logs", { title: "Admin Activity Logs" });
});

// Test Route
app.get("/", (req, res) => {
    res.render("home", {
        title: "Khushi Enterprises"
    });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;

const { getPool } = require("./connection");

async function createTables() {
    const db = getPool();
    try {
        console.log("Creating database tables according to final synopsis architecture...");

        await db.query(`CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(15),
            profile_pic VARCHAR(255),
            role ENUM('user','admin') DEFAULT 'user',
            status ENUM('active','blocked') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS categories (
            category_id INT AUTO_INCREMENT PRIMARY KEY,
            category_name VARCHAR(100) NOT NULL,
            description TEXT,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS products (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            category_id INT NULL,
            sku VARCHAR(100) UNIQUE,
            product_name VARCHAR(150) NOT NULL,
            description TEXT,
            size VARCHAR(50),
            color VARCHAR(50),
            material VARCHAR(100),
            price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount_price DECIMAL(10,2) DEFAULT NULL,
            stock INT DEFAULT 0,
            image VARCHAR(255),
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS product_images (
            image_id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            image_path VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS cart (
            cart_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_cart (user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS wishlist (
            wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_wishlist (user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS addresses (
            address_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            full_name VARCHAR(100),
            phone VARCHAR(15),
            address_line TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(10),
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS coupons (
            coupon_id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NOT NULL UNIQUE,
            discount_type ENUM('percentage','fixed') DEFAULT 'fixed',
            discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            expiry_date DATETIME,
            status ENUM('active','inactive') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS orders (
            order_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            address_id INT NULL,
            coupon_id INT NULL,
            total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            discount_amount DECIMAL(10,2) DEFAULT 0.00,
            payment_method VARCHAR(50) DEFAULT 'COD',
            payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
            order_status ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
            tracking_number VARCHAR(100),
            delivered_at DATETIME NULL,
            idempotency_key VARCHAR(100) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL,
            FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE SET NULL
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS order_items (
            order_item_id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS payments (
            payment_id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            payment_method VARCHAR(50),
            transaction_id VARCHAR(150),
            gateway_order_id VARCHAR(100) UNIQUE,
            gateway_payment_id VARCHAR(100) UNIQUE,
            gateway_amount INT NULL,
            gateway_currency CHAR(3) NULL,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            payment_status ENUM('pending','initiated','success','failed','refunded') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
            event_id VARCHAR(128) PRIMARY KEY,
            event_type VARCHAR(100) NOT NULL,
            processing_status ENUM('received','processed','failed') DEFAULT 'received',
            processed_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS reviews (
            review_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            review_text TEXT,
            status ENUM('pending','approved','rejected') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS contacts (
            contact_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(15),
            subject VARCHAR(150),
            message TEXT NOT NULL,
            status ENUM('new','read','replied') DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            subscriber_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL UNIQUE,
            status ENUM('active','unsubscribed') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS admin_logs (
            log_id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            action VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
            token_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            reset_token VARCHAR(255) NOT NULL UNIQUE,
            expires_at DATETIME NOT NULL,
            used_status ENUM('unused','used') DEFAULT 'unused',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS sessions (
            session_id VARCHAR(255) PRIMARY KEY,
            user_id INT NOT NULL,
            ip_address VARCHAR(50),
            user_agent TEXT,
            login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            status ENUM('active','expired','logout') DEFAULT 'active',
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('read','unread') DEFAULT 'unread',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )`);

        await db.query(`CREATE TABLE IF NOT EXISTS blogs (
            blog_id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE,
            image VARCHAR(255),
            short_description TEXT,
            content LONGTEXT,
            author VARCHAR(100),
            status ENUM('Draft','Published') DEFAULT 'Published',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        const indexes = [
            ["idx_orders_user_status", "orders", "user_id, order_status"],
            ["idx_cart_user", "cart", "user_id"],
            ["idx_wishlist_user", "wishlist", "user_id"],
            ["idx_reviews_product_status", "reviews", "product_id, status"],
            ["unique_orders_user_idempotency", "orders", "user_id, idempotency_key"]
        ];
        for (const [name, table, columns] of indexes) {
            try { await db.query(`CREATE INDEX ${name} ON ${table} (${columns})`); } catch (error) {
                if (error.code !== "ER_DUP_KEYNAME") throw error;
            }
        }

        console.log("All synopsis tables created successfully.");
    } catch (error) {
        console.error("Create table error:", error);
    }
}

module.exports = createTables;

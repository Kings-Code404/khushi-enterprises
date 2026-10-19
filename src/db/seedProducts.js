const { getPool } = require("./connection");

async function seedProducts() {
    try {
        const pool = getPool();
        const [products] = await pool.query("SELECT product_id FROM products LIMIT 1");
        if (products.length > 0) return;

        const [categories] = await pool.query("SELECT category_id FROM categories ORDER BY category_id ASC LIMIT 5");
        const ids = categories.map(c => c.category_id);
        while (ids.length < 5) ids.push(ids[0] || null);

        await pool.query(`
            INSERT INTO products
            (category_id, sku, product_name, description, size, color, material, price, discount_price, stock, image, status)
            VALUES
            (?, 'KE-BB-001', 'Classic Bean Bag', 'Comfortable beanbag for home and office use.', 'Large', 'Brown', 'Leatherette', 1999, 1799, 50, 'classic-brown-large-beanbag.webp', 'active'),
            (?, 'KE-BB-002', 'Premium Bean Bag', 'Premium quality beanbag with extra comfort.', 'XL', 'Black', 'Leatherette', 2499, 2299, 30, 'premium-black-xl-beanbag.webp', 'active'),
            (?, 'KE-BB-003', 'Kids Bean Bag', 'Soft and colorful beanbag for kids.', 'Medium', 'Blue', 'Fabric', 1499, 1299, 40, 'kids-blue-medium-beanbag.webp', 'active'),
            (?, 'KE-BB-004', 'Gaming Bean Bag Chair', 'Comfortable gaming beanbag for long sitting hours.', 'XL', 'Red', 'Fabric', 2199, 1999, 25, 'gaming-red-xl-beanbag.webp', 'active'),
            (?, 'KE-BB-005', 'Lounger Bean Bag', 'Relaxing lounger-style beanbag for living rooms.', 'XXL', 'Grey', 'Velvet', 2999, 2699, 20, 'lounger-grey-xxl-beanbag.webp', 'active')
        `, ids);

        await pool.query(`
            INSERT IGNORE INTO coupons (code, discount_type, discount_value, expiry_date, status) VALUES
            ('WELCOME20', 'percentage', 20.00, '2026-12-31 23:59:59', 'active'),
            ('KHUSHI100', 'fixed', 100.00, '2026-12-31 23:59:59', 'active')
        `).catch(() => null);

        console.log("✅ Sample products inserted");
    } catch (error) {
        console.error("Product Seeder Error:", error.message);
    }
}

module.exports = seedProducts;

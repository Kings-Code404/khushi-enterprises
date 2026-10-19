const { getPool } = require("./connection");

async function seedCategories() {
    try {
        const pool = getPool();
        const [rows] = await pool.query("SELECT category_id FROM categories LIMIT 1");
        if (rows.length > 0) return;

        await pool.query(`
            INSERT INTO categories (category_name, description, status) VALUES
            ('Bean Bags', 'Classic and comfortable bean bags.', 'active'),
            ('Premium Bean Bags', 'Premium quality bean bags.', 'active'),
            ('Kids Bean Bags', 'Soft bean bags for kids.', 'active'),
            ('Gaming Bean Bags', 'Bean bags designed for gaming.', 'active'),
            ('Lounger Bean Bags', 'Lounger-style bean bags.', 'active')
        `);
        console.log("✅ Categories seeded");
    } catch (error) {
        console.error("Category Seeder Error:", error.message);
    }
}

module.exports = seedCategories;

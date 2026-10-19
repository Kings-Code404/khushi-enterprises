const app = require("./app");
const { connectDB, closeDB } = require("./db/connection");
const createTables = require("./db/createTables");
const seedCategories = require("./db/seedCategories");
const seedProducts = require("./db/seedProducts");
const seedAdmin = require("./db/seedAdmin");
const { assertConfiguration } = require("./utils/config");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        assertConfiguration();
        await connectDB();
        await createTables();
        await seedCategories();
        await seedProducts();
        await seedAdmin();

        const server = app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
        const shutdown = () => server.close(() => closeDB().finally(() => process.exit(0)));
        process.once("SIGTERM", shutdown);
        process.once("SIGINT", shutdown);

    } catch (error) {
        console.error("❌ Server failed to start");
        console.error(error.message);
        process.exit(1);
    }
};

startServer();

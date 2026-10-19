const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

const connectionOptions = () => ({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...(process.env.DB_SSL === "true" ? { ssl: { minVersion: "TLSv1.2" } } : {})
});

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV !== "production") {
            const connection = await mysql.createConnection(connectionOptions());
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
            await connection.end();
        }

        pool = mysql.createPool({
            ...connectionOptions(),
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 10000,
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000
        });
        await pool.query("SELECT 1");
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error("Database not initialized");
    }
    return pool;
};

const closeDB = async () => {
    if (pool) await pool.end();
};

module.exports = {
    connectDB,
    getPool,
    closeDB
};

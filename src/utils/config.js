const requiredInProduction = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET", "SESSION_SECRET"];

function assertConfiguration(env = process.env) {
    if (env.NODE_ENV !== "production") return;
    const missing = requiredInProduction.filter((name) => !env[name] || /^REPLACE_|^CHANGE_THIS_|^YOUR_/i.test(env[name]));
    if (missing.length) throw new Error(`Missing secure production configuration: ${missing.join(", ")}`);
}

module.exports = { assertConfiguration };

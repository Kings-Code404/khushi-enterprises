const buckets = new Map();

function rateLimit({ windowMs, max, key = (req) => req.ip }) {
    return (req, res, next) => {
        const now = Date.now();
        const bucketKey = String(key(req) || req.ip);
        const entry = buckets.get(bucketKey);
        const active = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + windowMs };
        active.count += 1;
        buckets.set(bucketKey, active);
        res.set("RateLimit-Limit", String(max));
        res.set("RateLimit-Remaining", String(Math.max(0, max - active.count)));
        if (active.count > max) return res.status(429).json({ success: false, message: "Too many requests. Please try again later." });
        next();
    };
}

module.exports = { rateLimit };

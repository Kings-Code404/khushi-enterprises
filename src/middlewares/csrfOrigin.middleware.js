const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function csrfOrigin(req, res, next) {
    if (SAFE_METHODS.has(req.method) || !req.cookies?.token) return next();
    const origin = req.get("origin");
    if (!origin) return next(); // Native same-origin form submissions may omit Origin.
    const expected = `${req.protocol}://${req.get("host")}`;
    if (origin !== expected) return res.status(403).json({ success: false, message: "Invalid request origin." });
    next();
}

module.exports = csrfOrigin;

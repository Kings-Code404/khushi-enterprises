function notFound(req, res) {
    if (req.path.startsWith("/api/")) return res.status(404).json({ success: false, message: "Endpoint not found." });
    return res.status(404).render("404", { title: "404 | Page Not Found" });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    const status = err.status || (err.name === "MulterError" ? 400 : 500);
    const message = status < 500 ? err.message : "Something went wrong. Please try again.";
    if (process.env.NODE_ENV !== "test") console.error(err.message);
    if (req.path.startsWith("/api/")) return res.status(status).json({ success: false, message });
    return res.status(status).render("404", { title: `${status} | Error` });
}

module.exports = { notFound, errorHandler };

const express = require("express");

const {
    addProduct,
    getAllProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
    getLatestProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/product.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// Public Routes
router.get("/", getAllProducts);
router.get("/latest", getLatestProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Admin Routes
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    addProduct
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);

module.exports = router;
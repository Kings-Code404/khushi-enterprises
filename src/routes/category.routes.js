const express = require("express");

const {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/category.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

// Public
router.get("/", getAllCategories);

// Admin
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    addCategory
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCategory
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);

module.exports = router;
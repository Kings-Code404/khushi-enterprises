const Category = require("../models/category.model");

// Add Category
const addCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        await Category.createCategory(category_name);

        return res.status(201).json({
            success: true,
            message: "Category added successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add category."
        });
    }
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAllCategories();

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories."
        });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const categoryId = req.params.id;

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        await Category.updateCategory(categoryId, category_name);

        return res.status(200).json({
            success: true,
            message: "Category updated successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update category."
        });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        await Category.deleteCategory(categoryId);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete category."
        });
    }
};

module.exports = {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
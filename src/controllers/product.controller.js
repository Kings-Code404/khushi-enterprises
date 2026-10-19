const Product = require("../models/product.model");

// Add Product
const addProduct = async (req, res) => {
    try {
        const {
            category_id,
            product_name,
            description,
            size,
            color,
            material,
            price,
            stock,
            sku,
            discount_price,
            status
        } = req.body;

        if (!product_name || Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Product name and price are required."
            });
        }

        const image = req.file ? req.file.filename : null;

        await Product.createProduct(
            category_id || null,
            product_name,
            description,
            size,
            color,
            material,
            price,
            stock || 0,
            image,
            sku || null,
            discount_price || null,
            status || "active"
        );

        return res.status(201).json({
            success: true,
            message: "Product added successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product."
        });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const includeInactive = req.user?.role === "admin" && req.query.includeInactive === "true";
        const products = await Product.getAllProducts(includeInactive);

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products."
        });
    }
};

// Get Product Details
const getProductById = async (req, res) => {
    try {
        const product = await Product.getProductById(req.params.id, req.user?.role === "admin");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product details."
        });
    }
};

// Search Products
const searchProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const products = await Product.searchProducts(keyword);

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Search failed."
        });
    }
};

// Products By Category
const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.getProductsByCategory(
            req.params.categoryId
        );

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch category products."
        });
    }
};

// Latest Products
const getLatestProducts = async (req, res) => {
    try {
        const products = await Product.getLatestProducts(8);

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch latest products."
        });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const oldProduct = await Product.getProductById(productId);

        if (!oldProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        const {
            category_id,
            product_name,
            description,
            size,
            color,
            material,
            price,
            stock,
            sku,
            discount_price,
            status
        } = req.body;

        const image = req.file ? req.file.filename : oldProduct.image;

        await Product.updateProduct(
            productId,
            category_id || oldProduct.category_id,
            product_name || oldProduct.product_name,
            description || oldProduct.description,
            size || oldProduct.size,
            color || oldProduct.color,
            material || oldProduct.material,
            price ?? oldProduct.price,
            stock ?? oldProduct.stock,
            image,
            sku || oldProduct.sku,
            discount_price ?? oldProduct.discount_price,
            status || oldProduct.status || "active"
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully."
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product."
        });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.getProductById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        await Product.deleteProduct(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete product."
        });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
    getLatestProducts,
    updateProduct,
    deleteProduct
};
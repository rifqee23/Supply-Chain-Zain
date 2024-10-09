const express = require("express");
const { createProduct, getAllProduct, getProductById, editProductById, deleteProductById } = require("./product.service");

const router = express.Router();

// Create Product
router.post("/", async (req, res) => {
    try {
        const newProductData = req.body;
        const newProduct = await createProduct(newProductData);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get all Products
router.get("/", async (req, res) => {
    try {
        const products = await getAllProduct();
        res.status(200).send(products);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Get Product by ID
router.get("/:id", async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const product = await getProductById(productId);
        res.status(200).send(product);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Edit Product by ID
router.put("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = req.body;
        const updatedProduct = await editProductById(productId, productData);
        res.send(updatedProduct);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete Product by ID
router.delete("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        await deleteProductById(productId);
        res.status(204).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
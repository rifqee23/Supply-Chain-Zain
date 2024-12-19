const express = require("express");
const {
  createProduct,
  getAllProduct,
  getSupplierProducts,
  getProductById,
  editProductById,
  deleteProductById,
  getProductsByUserId,
} = require("./product.service");
const authorizeJWT = require("../middleware/authorizeJWT");
const adminAuthorization = require("../middleware/adminAuthorization");

const router = express.Router();

// Create Product (SUPPLIER only)
router.post("/", adminAuthorization, async (req, res) => {
  try {
    const userID = req.user.userID;
    const productData = {
      ...req.body,
      userID,
    };

    const newProduct = await createProduct(productData);
    res.status(201).json({
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Get all Products (Both SUPPLIER and STAKEHOLDER)
router.get("/", authorizeJWT, async (req, res) => {
  try {
    const { userId } = req.query;
    const products = await getAllProduct(userId);
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Get Supplier's Products (SUPPLIER only)
router.get("/supplier", adminAuthorization, async (req, res) => {
  try {
    const userID = req.user.userID;
    const products = await getSupplierProducts(userID);
    res.status(200).json({
      message: "Supplier products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Get Product by ID
router.get("/:productID", authorizeJWT, async (req, res) => {
  try {
    const productID = parseInt(req.params.productID);
    const product = await getProductById(productID);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Edit Product by ID (SUPPLIER only, and only their own products)
router.put("/:productID", adminAuthorization, async (req, res) => {
  try {
    const productID = parseInt(req.params.productID);
    const userID = req.user.userID;
    const productData = req.body;

    const updatedProduct = await editProductById(
      productID,
      productData,
      userID
    );
    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        message: error.message,
        error: error,
      });
    }
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Delete Product by ID (SUPPLIER only, and only their own products)
router.delete("/:productID", adminAuthorization, async (req, res) => {
  try {
    const productID = parseInt(req.params.productID);
    const userID = req.user.userID;

    await deleteProductById(productID, userID);
    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({
        message: error.message,
        error: error,
      });
    }
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

router.get("/user/:userID", authorizeJWT, async (req, res) => {
  try {
    const userID = parseInt(req.params.userID);
    const products = await getProductsByUserId(userID);

    res.status(200).json({
      message: "User products retrieved successfully",
      data: products,
    });
  } catch (error) {
    if (error.message.includes("No products found")) {
      return res.status(404).json({
        message: error.message,
        error: error,
      });
    }
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

module.exports = router;

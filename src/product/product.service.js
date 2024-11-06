const { 
    insertProduct, 
    findProducts, 
    findSupplierProducts,
    findProductById, 
    editProduct, 
    deleteProduct,
    findProductBySupplier
} = require("./product.repository");

// Create Product
async function createProduct(productData) {
    if (!productData.userID) {
        throw new Error("User ID is required");
    }
    const newProduct = await insertProduct(productData);
    return newProduct;
}

// Get all Products
async function getAllProduct() {
    const products = await findProducts();
    return products;
}

// Get Supplier's Products
async function getSupplierProducts(userID) {
    const products = await findSupplierProducts(userID);
    return products;
}

// Get Product By ID
async function getProductById(productID) {
    const product = await findProductById(productID);
    if(!product) {
        throw Error("Product not found");
    }
    return product;
}

// Edit Product
async function editProductById(productID, productData, userID) {
    // Verifikasi kepemilikan produk
    const product = await findProductBySupplier(productID, userID);
    if (!product) {
        throw Error("Product not found or you don't have permission to edit this product");
    }

    // Update produk
    const updatedProduct = await editProduct(productID, productData);
    return updatedProduct;
}

// Delete Product
async function deleteProductById(productID, userID) {
    // Verifikasi kepemilikan produk
    const product = await findProductBySupplier(productID, userID);
    if (!product) {
        throw Error("Product not found or you don't have permission to delete this product");
    }

    // Hapus produk
    await deleteProduct(productID);
}

module.exports = {
    createProduct,
    getAllProduct,
    getSupplierProducts,
    getProductById,
    editProductById,
    deleteProductById
};
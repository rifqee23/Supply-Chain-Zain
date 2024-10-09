const { insertProduct, findProduct, findProductById, editProduct, deleteProduct } = require("./product.repository");

// Create Product
async function createProduct(newProductData) {
    const newProduct = await insertProduct(newProductData);
    return newProduct;
}

// Get all Products
async function getAllProduct() {
    const products = await findProduct();
    return products;
}

// Get Product By ID
async function getProductById(id) {
    const product = await findProductById(id);
    if(!product) {
        throw Error("Product not found");
    }
    return product;
}

// Edit Product
async function editProductById(id, productData) {
    await findProductById(id);
    const updatedProduct = await editProduct(id, productData);
    return updatedProduct;
}

// Delete Product
async function deleteProductById(id) {
    await getProductById(id);
    await deleteProduct(id);
}

module.exports = {
    createProduct,
    getAllProduct,
    getProductById,
    editProductById,
    deleteProductById,
};

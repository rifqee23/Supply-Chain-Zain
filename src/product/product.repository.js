const prisma = require("../db");

// Create Product
async function insertProduct(productData) {
    const newProduct = await prisma.products.create({
        data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
        },
    });
    return newProduct;
}

// Get all Products
async function findProduct() {
    const products = await prisma.products.findMany();
    return products;
}

// Get Product by ID
async function findProductById(id) {
    const product = await prisma.products.findUnique({
        where: {
            id: parseInt(id),
        },
    });
    return product;
}

// Edit Product
async function editProduct(id, productData) {
    const updatedProduct = await prisma.products.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
        },
    });
    return updatedProduct;
}

// Delete Product
async function deleteProduct(id) {
    await prisma.products.delete({
        where: {
            id: parseInt(id),
        },
    });
}

module.exports = {
    insertProduct,
    findProduct,
    findProductById,
    editProduct,
    deleteProduct,
};
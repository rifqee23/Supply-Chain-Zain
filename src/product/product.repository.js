const prisma = require("../db");

// Define valid values
const VALID_UNIT_TYPES = ["METER", "KG", "PCS", "ROLL", "PACK"];
const VALID_CATEGORIES = [
  "UPPER",
  "SOLE",
  "INSOLE",
  "SHOELACES",
  "HEEL",
  "TONGUE",
  "EYELETS",
  "TOE_CAP",
  "QUARTER",
  "LINING",
  "PADDING",
];

// Create Product
async function insertProduct(productData) {
  if (!productData.userID) {
    throw new Error("User ID is required");
  }

  if (!VALID_UNIT_TYPES.includes(productData.unit)) {
    throw new Error(
      "Invalid unit type. Must be one of: METER, KG, PCS, ROLL, PACK"
    );
  }

  if (!VALID_CATEGORIES.includes(productData.category)) {
    throw new Error("Invalid category");
  }

  try {
    const newProduct = await prisma.products.create({
      data: {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.category,
        unit: productData.unit,
        material: productData.material,
        supplier: {
          connect: { userID: productData.userID },
        },
      },
      include: {
        supplier: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return {
      ...newProduct,
      message: `Product created successfully with ${newProduct.stock} ${newProduct.unit}`,
    };
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

// Get all Products
async function findProducts() {
  const products = await prisma.products.findMany({
    include: {
      supplier: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });
  return products;
}

// Get Supplier's Products
async function findSupplierProducts(userID) {
  const products = await prisma.products.findMany({
    where: {
      userID: userID,
    },
    include: {
      Orders: true,
      supplier: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });
  return products;
}

// Get Product by ID
async function findProductById(productID) {
  const product = await prisma.products.findUnique({
    where: {
      productID: productID,
    },
    include: {
      supplier: {
        select: {
          username: true,
          email: true,
        },
      },
      Orders: true,
    },
  });
  return product;
}

// Edit Product
async function editProduct(productID, productData) {
  // Validate unit type if provided
  if (productData.unit && !VALID_UNIT_TYPES.includes(productData.unit)) {
    throw new Error(
      "Invalid unit type. Must be one of: METER, KG, PCS, ROLL, PACK"
    );
  }

  // Validate category if provided
  if (
    productData.category &&
    !VALID_CATEGORIES.includes(productData.category)
  ) {
    throw new Error("Invalid category");
  }

  try {
    const updatedProduct = await prisma.products.update({
      where: {
        productID: productID,
      },
      data: {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        category: productData.category,
        unit: productData.unit,
        material: productData.material,
        userID: productData.userID,
      },
      include: {
        supplier: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return {
      ...updatedProduct,
      message: `Product updated successfully with ${updatedProduct.stock} ${updatedProduct.unit}`,
    };
  } catch (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

// Delete Product
async function deleteProduct(productID) {
  await prisma.products.delete({
    where: {
      productID: productID,
    },
  });
}

// Check if product belongs to supplier
async function findProductBySupplier(productID, userID) {
  const product = await prisma.products.findFirst({
    where: {
      productID: productID,
      userID: userID,
    },
  });
  return product;
}

// Update Product Stock
async function updateProductStock(productID, quantity, isIncrement = true) {
  const product = await prisma.products.findUnique({
    where: { productID: productID },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const newStock = isIncrement
    ? product.stock + quantity
    : product.stock - quantity;

  if (newStock < 0) {
    throw new Error("Insufficient stock");
  }

  return await prisma.products.update({
    where: { productID: productID },
    data: { stock: newStock },
  });
}

async function findProductsByUserId(userID) {
  const products = await prisma.products.findMany({
    where: {
      userID: userID,
    },
    include: {
      supplier: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  });
  return products;
}

module.exports = {
  insertProduct,
  findProducts,
  findSupplierProducts,
  findProductById,
  editProduct,
  deleteProduct,
  findProductBySupplier,
  updateProductStock,
  findProductsByUserId,
};

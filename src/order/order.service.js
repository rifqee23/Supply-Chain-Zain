const OrderRepository = require("./order.repository");
const prisma = require("../db");
const { updateProductStock } = require("../product/product.repository");
const path = require("path");
const QRCode = require("qrcode");
const fs = require("fs");
const axios = require("axios");

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  // Create new order
  async createOrder(orderData) {
    await this.validateOrderData(orderData);
    return this.orderRepository.create(orderData);
  }

  async getUserOrders(userID) {
    return this.orderRepository.findUserOrders(userID);
  }

  async getSupplierOrders(userID) {
    return this.orderRepository.findSupplierOrders(userID);
  }

  async getOrderById(orderID, supplierUserID) {
    // Use the repository method to find the order
    return this.orderRepository.getOrderById(orderID, supplierUserID);
  }

  async getSupplierOrderDetails(orderID, supplierUserID) {
    // Check if order exists and belongs to supplier's products
    const isSupplierProduct = await this.orderRepository.checkSupplierProduct(
      orderID,
      supplierUserID
    );

    if (!isSupplierProduct) {
      throw new Error("Order not found or unauthorized access");
    }

    const order = await this.orderRepository.findById(orderID);

    // Return only necessary order details
    return {
      orderID: order.orderID,
      status: order.status,
      quantity: order.quantity,
      created_at: order.created_at,
      updated_at: order.updated_at,
      product: {
        name: order.product.name,
        description: order.product.description,
        price: order.product.price,
      },
      customer: {
        username: order.user.username,
        email: order.user.email,
      },
    };
  }

  async getSupplierOrderHistory(supplierUserID) {
    return this.orderRepository.findSupplierOrderHistory(supplierUserID);
  }

  // Update order status
  async updateOrderStatus(orderID, status, supplierUserID) {
    // Validasi existing code...
    const isSupplierProduct = await this.orderRepository.checkSupplierProduct(
      orderID,
      supplierUserID
    );

    if (!isSupplierProduct) {
      throw new Error("Order not found or unauthorized access");
    }

    // Validasi status
    if (!Object.values(StatusRole).includes(status)) {
      throw new Error("Invalid status");
    }

    const currentOrder = await this.orderRepository.findById(orderID);
    if (!currentOrder) {
      throw new Error("Order not found");
    }

    // Manajemen stok
    if (
      status === StatusRole.ON_PROGRESS &&
      currentOrder.status === StatusRole.PENDING
    ) {
      await updateProductStock(
        currentOrder.productID,
        currentOrder.quantity,
        false
      );
    } else if (
      status === StatusRole.REJECT &&
      currentOrder.status === StatusRole.ON_PROGRESS
    ) {
      await updateProductStock(
        currentOrder.productID,
        currentOrder.quantity,
        true
      );
    }

    // Generate QR Code
    let qrCodePath = null;
    if (status === StatusRole.ON_PROGRESS || status === StatusRole.SUCCESS) {
      const orderDetailsUrl = `${process.env.BASE_URL}/${orderID}`;

      // Generate QR Code as a buffer
      const qrCodeBuffer = await QRCode.toBuffer(orderDetailsUrl, {
        color: {
          dark: "#000",
          light: "#FFF",
        },
      });

      // Upload to Imgur
      const response = await axios.post(
        "https://api.imgur.com/3/image",
        {
          image: qrCodeBuffer.toString("base64"),
          type: "base64",
        },
        {
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
        }
      );

      qrCodePath = response.data.data.link; // URL dari gambar yang diupload
    }

    // Update status dengan path QR code
    return this.orderRepository.updateStatusWithQRCode(
      orderID,
      status,
      qrCodePath
    );
  }

  // Delete order
  async deleteOrder(orderID, userID) {
    const order = await this.orderRepository.findById(orderID);

    if (!order) {
      throw new Error("Order not found");
    }
    // Only order owner can delete
    if (order.userID !== userID) {
      throw new Error("Unauthorized access");
    }
    if (order.status === "ON_PROGRESS") {
      await updateProductStock(order.productID, order.quantity, true);
    }
    return this.orderRepository.delete(orderID);
  }

  // Validate order data
  async validateOrderData(orderData) {
    const { userID, productID, quantity } = orderData;

    if (!productID || !quantity) {
      throw new Error("Product ID and quantity are required");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
    const product = await prisma.Products.findUnique({
      where: { productID },
    });
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    const user = await prisma.Users.findUnique({
      where: { userID },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (user.role !== "STAKEHOLDER") {
      throw new Error("Only STAKEHOLDER can create orders");
    }
  }

  async getOrderHistory(userID, role) {
    return this.orderRepository.findOrderHistory(userID, role);
  }

  async updateOrderHistory(historyID, supplierUserID, updateData) {
    // Verify supplier owns the product associated with this order
    const isSupplierProduct = await this.orderRepository.checkSupplierProduct(
      historyID,
      supplierUserID
    );

    if (!isSupplierProduct) {
      throw new Error("Order history entry not found or unauthorized access");
    }

    const safeUpdateData = this.sanitizeUpdateData(updateData);
    return this.orderRepository.updateHistoryEntry(historyID, safeUpdateData);
  }

  async deleteOrderHistory(historyID, supplierUserID) {
    // Verify supplier owns the product associated with this order
    const isSupplierProduct = await this.orderRepository.checkSupplierProduct(
      historyID,
      supplierUserID
    );

    if (!isSupplierProduct) {
      throw new Error("Order history entry not found or unauthorized access");
    }

    return this.orderRepository.deleteHistoryEntry(historyID);
  }

  sanitizeUpdateData(updateData) {
    return updateData;
  }
}

const StatusRole = {
  PENDING: "PENDING",
  ON_PROGRESS: "ON_PROGRESS",
  SUCCESS: "SUCCESS",
  REJECT: "REJECT",
};

module.exports = OrderService;

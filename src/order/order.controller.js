const express = require("express");
const OrderService = require("./order.service");
const router = express.Router();
const orderService = new OrderService();
const authorizeJWT = require("../middleware/authorizeJWT");
const adminAuthorization = require("../middleware/adminAuthorization");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

// Create Order (STAKEHOLDER only)
router.post("/", authorizeJWT, async (req, res) => {
  try {
    console.log("User ID from token:", req.userID);
    console.log("User role from token:", req.role);
    console.log("Request body:", req.body);

    const userID = req.userID;
    const user_role = req.role;

    if (user_role !== "STAKEHOLDER") {
      return res.status(403).json({
        message: "Unauthorized access. Only stakeholders can create orders.",
      });
    }

    const { productID, quantity } = req.body;
    const newOrder = await orderService.createOrder({
      userID,
      productID,
      quantity,
    });

    res.status(201).json({
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

// Get all Orders (SUPPLIER only - to see orders for their products)
router.get("/", adminAuthorization, async (req, res) => {
  try {
    const userID = req.userID; // This is the supplier's userID
    const orders = await orderService.getSupplierOrders(userID);
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

// Get User's Orders (STAKEHOLDER) Melihat semua pesanan stakeholder
router.get("/my-orders", authorizeJWT, async (req, res) => {
  try {
    const userID = req.userID;
    const orders = await orderService.getUserOrders(userID);
    res.status(200).json({
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

// Get history - accessible by both SUPPLIER and STAKEHOLDER
router.get("/history", authorizeJWT, async (req, res) => {
  try {
    const userID = req.userID;
    const role = req.role;
    const history = await orderService.getOrderHistory(userID, role);
    res.status(200).json({
      message: "Order history retrieved successfully",
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error: error,
    });
  }
});

// Update history entry - SUPPLIER only
router.put("/history/:id", adminAuthorization, async (req, res) => {
  try {
    const historyID = parseInt(req.params.id);
    const supplierUserID = req.userID;
    const updateData = req.body;

    const updatedHistory = await orderService.updateOrderHistory(
      historyID,
      supplierUserID,
      updateData
    );

    res.status(200).json({
      message: "History entry updated successfully",
      data: updatedHistory,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete history entry - SUPPLIER only
router.delete("/history/:id", adminAuthorization, async (req, res) => {
  try {
    const historyID = parseInt(req.params.id);
    const supplierUserID = req.userID;

    await orderService.deleteOrderHistory(historyID, supplierUserID);

    res.status(200).json({
      message: "History entry deleted successfully",
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// supplier melihat history orderan pada barangnya
// router.get("/supplier/history", adminAuthorization, async (req, res) => {
//     try {
//         const supplierUserID = req.userID;
//         const orders = await orderService.getSupplierOrderHistory(supplierUserID);
//         res.status(200).json({
//             message: "Supplier order history retrieved successfully",
//             data: orders
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//             error: error
//         });
//     }
// });

//  hapus order oleh stakeholder
router.delete("/:id", authorizeJWT, async (req, res) => {
  try {
    const orderID = parseInt(req.params.id);
    const userID = req.userID;
    await orderService.deleteOrder(orderID, userID);
    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    if (
      error.message === "Order not found" ||
      error.message === "Unauthorized access"
    ) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Add this new endpoint for suppliers to get order details by ID
router.get("/supplier/order/:id", async (req, res) => {
  try {
    const orderID = parseInt(req.params.id);
    const supplierUserID = req.userID;
    const order = await orderService.getSupplierOrderDetails(
      orderID,
      supplierUserID
    );
    res.status(200).json({
      message: "Order details retrieved successfully",
      data: order,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("unauthorized")
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Modify the update status endpoint to generate QR code
router.put("/status", adminAuthorization, async (req, res) => {
  try {
    const { orderID, status } = req.body;
    const supplierUserID = req.userID;

    // Update status order
    const updatedOrder = await orderService.updateOrderStatus(
      orderID,
      status,
      supplierUserID
    );

    res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
      qrCodePath: updatedOrder.qr_code, // Path QR code
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

router.get("/qr-code/:orderID", async (req, res) => {
  try {
    const orderID = parseInt(req.params.orderID);
    const supplierUserID = req.userID;

    // Validate order and access
    const order = await orderService.getOrderById(orderID, supplierUserID);

    if (!order.qr_code) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // Construct absolute path to QR code file
    const qrCodePath = path.join(__dirname, "../public", order.qr_code);

    // Verify file exists before attempting to download
    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: "QR Code file not found" });
    }

    // Stream file with meaningful filename
    res.download(qrCodePath, `order_${orderID}_qr.png`, (err) => {
      if (err) {
        console.error("QR Code download error:", err);
        res.status(500).json({
          message: "Error downloading QR code",
          error: err,
        });
      }
    });
  } catch (error) {
    console.error("QR Code retrieval error:", error);
    res.status(400).json({
      message: error.message,
      error: error,
    });
  }
});

module.exports = router;

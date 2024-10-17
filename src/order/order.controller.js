const express = require("express");
const OrderService = require('./order.service');

const router = express.Router();
const orderService = new OrderService();

const authorizeJWT = require('../middleware/authorizeJWT');
const adminAuthorization = require('../middleware/adminAuthorization');

// Create Order
router.post("/", authorizeJWT, async (req, res) => {
    try {
        const { user_id, status, products } = req.body;
        const newOrder = await orderService.createOrder({ user_id, status, products });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all Orders
router.get("/", adminAuthorization, async (req, res) => {
    try {
        const orders = await orderService.getOrders();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Order by ID
router.get("/:id", authorizeJWT, async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Order by ID
router.put("/:id", adminAuthorization, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        const { status, products } = req.body;
        if (!status && (!products || products.length === 0)) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const updatedOrder = await orderService.updateOrder(orderId, { status, products });
        if (updatedOrder) {
            res.status(200).json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete Order by ID
router.delete("/:id", adminAuthorization, async (req, res) => {
    try {
        const result = await orderService.deleteOrder(req.params.id);
        if (result) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
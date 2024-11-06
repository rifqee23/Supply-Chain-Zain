const OrderRepository = require('./order.repository');
const prisma = require('../db');
const { updateProductStock } = require('../product/product.repository');

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

    async getOrderById(orderID, userID) {
        // Periksa apakah order ada dan dimiliki oleh user tersebut
        const order = await this.orderRepository.findById(orderID);
        if (!order || order.userID !== userID) {
            throw new Error('Order not found or Unauthorized access');
        }
        return order;
    }

    async getSupplierOrderDetails(orderID, supplierUserID) {
        // Check if order exists and belongs to supplier's products
        const isSupplierProduct = await this.orderRepository.checkSupplierProduct(orderID, supplierUserID);

        if (!isSupplierProduct) {
            throw new Error('Order not found or unauthorized access');
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
                price: order.product.price
            },
            customer: {
                username: order.user.username,
                email: order.user.email
            }
        };
    }

    async getSupplierOrderHistory(supplierUserID) {
        return this.orderRepository.findSupplierOrderHistory(supplierUserID);
    }

    // Update order status
    async updateOrderStatus(orderID, status, supplierUserID) {
        // Check if order exists and belongs to supplier's products
        const isSupplierProduct = await this.orderRepository.checkSupplierProduct(orderID, supplierUserID);

        if (!isSupplierProduct) {
            throw new Error('Order not found or unauthorized access');
        }

        // Validate status
        if (!Object.values(StatusRole).includes(status)) {
            throw new Error('Invalid status');
        }

        // Get current order
        const currentOrder = await this.orderRepository.findById(orderID);
        if (!currentOrder) {
            throw new Error('Order not found');
        }

        // Handle stock management based on status change
        if (status === StatusRole.ON_PROGRESS && currentOrder.status === StatusRole.PENDING) {
            // Kurangi stok jika status berubah dari PENDING ke ON_PROGRESS
            await updateProductStock(currentOrder.productID, currentOrder.quantity, false);
        } else if (status === StatusRole.REJECT && currentOrder.status === StatusRole.ON_PROGRESS) {
            // Jika status berubah menjadi REJECT dari ON_PROGRESS, kembalikan stok
            await updateProductStock(currentOrder.productID, currentOrder.quantity, true);
        }

        return this.orderRepository.updateStatus(orderID, status);
    }

    // Delete order
    async deleteOrder(orderID, userID) {
        const order = await this.orderRepository.findById(orderID);
        
        if (!order) {
            throw new Error('Order not found');
        }
        // Only order owner can delete
        if (order.userID !== userID) {
            throw new Error('Unauthorized access');
        }
        if (order.status === 'ON_PROGRESS') {
            await updateProductStock(order.productID, order.quantity, true);
        }
        return this.orderRepository.delete(orderID);
    }

    // Validate order data
    async validateOrderData(orderData) {
        const { userID, productID, quantity } = orderData;

        if (!productID || !quantity) {
            throw new Error('Product ID and quantity are required');
        }
        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        const product = await prisma.Products.findUnique({
            where: { productID }
        });
        if (!product) {
            throw new Error('Product not found');
        }
        if (product.stock < quantity) {
            throw new Error('Insufficient stock');
        }
        const user = await prisma.Users.findUnique({
            where: { userID }
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.role !== 'STAKEHOLDER') {
            throw new Error('Only STAKEHOLDER can create orders');
        }
    }
}

const StatusRole = {
    PENDING: 'PENDING',
    ON_PROGRESS: 'ON_PROGRESS',
    SUCCESS: 'SUCCESS',
    REJECT: 'REJECT'
  };

module.exports = OrderService;
const OrderRepository = require('./order.repository');
const prisma = require('../db');

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async createOrder(orderData) {
    await this.validateOrderData(orderData);
    return this.orderRepository.create(orderData);
  }

  async getOrders() {
    return this.orderRepository.findAll();
  }

  async getOrderById(id) {
    return this.orderRepository.findById(id);
  }

  async updateOrder(id, orderData) {
    await this.validateOrderData(orderData);
    return this.orderRepository.update(id, orderData);
  }

  async deleteOrder(id) {
    return this.orderRepository.delete(id);
  }

  async validateOrderData(orderData) {
    if (!orderData.user_id) {
      throw new Error('User ID is required');
    }
    if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
      throw new Error('At least one product is required');
    }
    
    // Validasi keberadaan produk
    for (let product of orderData.products) {
      if (!product.product_id || !product.quantity || product.quantity <= 0) {
        throw new Error('Invalid product data');
      }
      
      const existingProduct = await prisma.products.findUnique({
        where: { id: product.product_id }
      });
      
      if (!existingProduct) {
        throw new Error(`Product with id ${product.product_id} does not exist`);
      }
    }
    
    // Validasi keberadaan user
    const existingUser = await prisma.users.findUnique({
      where: { id: orderData.user_id }
    });
    
    if (!existingUser) {
      throw new Error(`User with id ${orderData.user_id} does not exist`);
    }
  }
}

module.exports = OrderService;
const prisma = require('../db');

class OrderRepository {
  async create(orderData) {
    const { user_id, status, products } = orderData;
    return await prisma.orders.create({
      data: {
        user_id,
        status,
        OrderItems: {
          create: products.map(product => ({
            product: {
              connect: { id: product.product_id }
            },
            quantity: product.quantity
          }))
        }
      },
      include: {
        OrderItems: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findAll() {
    return await prisma.orders.findMany({
      include: {
        user: true,
        OrderItems: {
          include: {
            product: true
          }
        },
        Labels: true,
      },
    });
  }

  async findById(id) {
    return await prisma.orders.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        OrderItems: {
          include: {
            product: true
          }
        },
        Labels: true,
      },
    });
  }

  async update(id, orderData) {
    const { status, products } = orderData;
    return await prisma.orders.update({
      where: { id: parseInt(id) },
      data: {
        status,
        OrderItems: {
          deleteMany: {},
          create: products.map(product => ({
            product: {
              connect: { id: product.product_id }
            },
            quantity: product.quantity
          }))
        }
      },
      include: {
        OrderItems: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async delete(id) {
    await prisma.orderItems.deleteMany({
      where: { order_id: parseInt(id) }
    });
    return await prisma.orders.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = OrderRepository;
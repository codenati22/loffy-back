const orderService = require("../services/orderService");

class OrderController {
  constructor() {
    this.getOrders = this.getOrders.bind(this);
    this.createOrder = this.createOrder.bind(this);
  }

  async getOrders(req, res, next) {
    try {
      console.log("Fetching orders for user:", req.user.userId);
      const orders = await orderService.getOrders(
        req.supabase,
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(
        req.supabase,
        req.user.userId
      );
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

module.exports = new OrderController();

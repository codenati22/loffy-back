const cartService = require("../services/cartService");

class CartController {
  constructor() {
    this.getCart = this.getCart.bind(this);
    this.addToCart = this.addToCart.bind(this);
    this.removeFromCart = this.removeFromCart.bind(this);
  }

  async getCart(req, res, next) {
    try {
      console.log("Fetching cart for user:", req.user.userId); // Debug log
      const cartItems = await cartService.getCartItems(
        req.supabase,
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: cartItems,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const { coffeeId, quantity } = req.body;
      if (!coffeeId || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "coffeeId and quantity (positive number) are required",
        });
      }
      const cartItem = await cartService.addToCart(
        req.supabase,
        req.user.userId,
        coffeeId,
        quantity
      );
      res.status(201).json({
        success: true,
        data: cartItem,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async removeFromCart(req, res, next) {
    try {
      const { id } = req.params;
      console.log("User ID from token:", req.user.userId);
      console.log("Removing cart item with ID:", id);
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Cart item ID is required",
        });
      }
      await cartService.removeFromCart(req.supabase, id);
      res.status(200).json({
        success: true,
        message: "Cart item removed successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

module.exports = new CartController();

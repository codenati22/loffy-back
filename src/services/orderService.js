const logger = require("../utils/logger");

class OrderService {
  async getOrders(supabase, userId) {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          user_id,
          total_amount,
          status,
          created_at,
          updated_at,
          order_items (
            id,
            coffee_id,
            quantity,
            price,
            coffees!order_items_coffee_id_fkey(name, imageurl, category)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      return orders.map((order) => ({
        ...order,
        order_items: order.order_items.map((item) => ({
          ...item,
          coffee: item.coffees || null,
        })),
      }));
    } catch (error) {
      logger.error(`Error in OrderService.getOrders: ${error.message}`);
      throw error;
    }
  }

  async createOrder(supabase, userId) {
    try {
      const { data: cartItems, error: cartError } = await supabase
        .from("cart")
        .select(
          `
          id,
          coffee_id,
          quantity,
          coffees!cart_coffee_id_fkey(price)
        `
        )
        .eq("user_id", userId);

      if (cartError) {
        throw new Error(`Failed to fetch cart items: ${cartError.message}`);
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.coffees.price * item.quantity,
        0
      );

      const { data: order, error: orderError } = await supabase.rpc(
        "create_order_with_items",
        {
          p_user_id: userId,
          p_total_amount: totalAmount,
        }
      );

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      const { error: clearCartError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", userId);

      if (clearCartError) {
        throw new Error(`Failed to clear cart: ${clearCartError.message}`);
      }

      return (
        order[0] || {
          order_id: null,
          user_id: null,
          total_amount: null,
          status: null,
          created_at: null,
          updated_at: null,
        }
      );
    } catch (error) {
      logger.error(`Error in OrderService.createOrder: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new OrderService();

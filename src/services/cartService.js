const logger = require("../utils/logger");

class CartService {
  // Get all cart items for a user
  async getCartItems(supabase, userId) {
    try {
      const { data: cartItems, error } = await supabase
        .from("cart")
        .select(
          `
          id,
          quantity,
          coffees!cart_coffee_id_fkey(id, name, price, imageurl, category)
        `
        )
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to fetch cart items: ${error.message}`);
      }

      return cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        coffee: item.coffees
          ? {
              id: item.coffees.id,
              name: item.coffees.name,
              price: item.coffees.price,
              imageUrl: item.coffees.imageurl,
              category: item.coffees.category,
            }
          : null,
      }));
    } catch (error) {
      logger.error(`Error in CartService.getCartItems: ${error.message}`);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(supabase, userId, coffeeId, quantity) {
    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from("cart")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("coffee_id", coffeeId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(
          `Failed to check existing cart item: ${fetchError.message}`
        );
      }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const { data, error: updateError } = await supabase
          .from("cart")
          .update({ quantity: newQuantity, updated_at: new Date() })
          .eq("id", existingItem.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update cart item: ${updateError.message}`);
        }
        return data;
      } else {
        const { data, error: insertError } = await supabase
          .from("cart")
          .insert([
            {
              user_id: userId,
              coffee_id: coffeeId,
              quantity,
              updated_at: new Date(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to add cart item: ${insertError.message}`);
        }
        return data;
      }
    } catch (error) {
      logger.error(`Error in CartService.addToCart: ${error.message}`);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(supabase, cartItemId) {
    try {
      const { count, error } = await supabase
        .from("cart")
        .delete()
        .eq("id", cartItemId)
        .select() // Include select to get the count of deleted rows
        .then((result) => ({
          count: result.data ? result.data.length : 0,
          error: result.error,
        }));

      if (error) {
        throw new Error(`Failed to remove cart item: ${error.message}`);
      }

      if (count === 0) {
        throw new Error(
          "Cart item not found or you do not have permission to delete it"
        );
      }
    } catch (error) {
      logger.error(`Error in CartService.removeFromCart: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CartService();

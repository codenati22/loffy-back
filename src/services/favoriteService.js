const logger = require("../utils/logger");

class FavoriteService {
  async getFavoriteItems(supabase, userId) {
    try {
      const { data: favoriteItems, error } = await supabase
        .from("favorites")
        .select(
          `
          id,
          coffees!favorites_coffee_id_fkey(id, name, price, imageurl, category)
        `
        )
        .eq("userid", userId);

      if (error) {
        throw new Error(`Failed to fetch favorite items: ${error.message}`);
      }

      return favoriteItems.map((item) => ({
        id: item.id,
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
      logger.error(
        `Error in FavoriteService.getFavoriteItems: ${error.message}`
      );
      throw error;
    }
  }

  async addToFavorites(supabase, userId, coffeeId) {
    try {
      const { data, error: insertError } = await supabase
        .from("favorites")
        .insert([
          {
            userid: userId,
            coffee_id: coffeeId,
            updated_at: new Date(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to add favorite item: ${insertError.message}`);
      }
      return data;
    } catch (error) {
      logger.error(`Error in FavoriteService.addToFavorites: ${error.message}`);
      throw error;
    }
  }

  async removeFromFavorites(supabase, favoriteItemId) {
    try {
      const { count, error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteItemId)
        .select()
        .then((result) => ({
          count: result.data ? result.data.length : 0,
          error: result.error,
        }));

      if (error) {
        throw new Error(`Failed to remove favorite item: ${error.message}`);
      }

      if (count === 0) {
        throw new Error(
          "Favorite item not found or you do not have permission to delete it"
        );
      }
    } catch (error) {
      logger.error(
        `Error in FavoriteService.removeFromFavorites: ${error.message}`
      );
      throw error;
    }
  }
}

module.exports = new FavoriteService();

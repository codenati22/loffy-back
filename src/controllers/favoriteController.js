const favoriteService = require("../services/favoriteService");

class FavoriteController {
  constructor() {
    this.getFavorites = this.getFavorites.bind(this);
    this.addToFavorites = this.addToFavorites.bind(this);
    this.removeFromFavorites = this.removeFromFavorites.bind(this);
  }

  async getFavorites(req, res, next) {
    try {
      console.log("Fetching favorites for user:", req.user.userId);
      const favoriteItems = await favoriteService.getFavoriteItems(
        req.supabase,
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: favoriteItems,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async addToFavorites(req, res, next) {
    try {
      const { coffeeId } = req.body;
      if (!coffeeId) {
        return res.status(400).json({
          success: false,
          message: "coffeeId is required",
        });
      }
      const favoriteItem = await favoriteService.addToFavorites(
        req.supabase,
        req.user.userId,
        coffeeId
      );
      res.status(201).json({
        success: true,
        data: favoriteItem,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async removeFromFavorites(req, res, next) {
    try {
      const { id } = req.params;
      console.log("Removing favorite item with ID:", id);
      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Favorite item ID is required in the URL path (e.g., /api/favorites/1)",
        });
      }
      await favoriteService.removeFromFavorites(req.supabase, id);
      res.status(200).json({
        success: true,
        message: "Favorite item removed successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

module.exports = new FavoriteController();

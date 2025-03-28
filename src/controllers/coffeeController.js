const coffeeService = require("../services/coffeeService");
const dotenv = require("dotenv");

dotenv.config();

class CoffeeController {
  constructor() {
    this.getAllCoffees = this.getAllCoffees.bind(this);
    this.createCoffee = this.createCoffee.bind(this);
    this.updateCoffee = this.updateCoffee.bind(this);
    this.deleteCoffee = this.deleteCoffee.bind(this);
  }

  async getAllCoffees(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (page < 1 || limit < 1) {
        return res.status(400).json({
          success: false,
          message: "Page and limit must be positive integers",
        });
      }

      const result = await coffeeService.getAllCoffees(
        req.supabase,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result.coffees,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async createCoffee(req, res, next) {
    try {
      const { name, price, rating, category, description } = req.body;
      const imageFile = req.file;

      if (!name || !price || !rating || !category || !imageFile) {
        return res.status(400).json({
          success: false,
          message: "Name, price, rating, category, and image are required",
        });
      }

      const coffee = await coffeeService.createCoffee(
        req.supabase,
        name,
        parseFloat(price),
        parseFloat(rating),
        category,
        description,
        imageFile
      );

      res.status(201).json({
        success: true,
        data: coffee,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async updateCoffee(req, res, next) {
    try {
      const { id } = req.params;
      const { name, price, rating, category, description } = req.body;
      const imageFile = req.file;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid ID is required",
        });
      }

      const coffee = await coffeeService.updateCoffee(
        req.supabase,
        parseInt(id),
        name || undefined,
        price ? parseFloat(price) : undefined,
        rating ? parseFloat(rating) : undefined,
        category || undefined,
        description || undefined,
        imageFile
      );

      if (!coffee) {
        return res.status(404).json({
          success: false,
          message: "Coffee item not found",
        });
      }

      res.status(200).json({
        success: true,
        data: coffee,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async deleteCoffee(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: "Valid ID is required",
        });
      }

      const result = await coffeeService.deleteCoffee(
        req.supabase,
        parseInt(id)
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Coffee item not found",
        });
      }

      res.status(200).json({
        success: true,
        data: { message: "Coffee item deleted" },
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

module.exports = new CoffeeController();

const logger = require("../utils/logger");
const storageService = require("./storageService");

class CoffeeService {
  async getAllCoffees(supabase) {
    try {
      const { data: coffees, error } = await supabase
        .from("coffees")
        .select("*");

      if (error) {
        throw new Error(`Failed to fetch coffees: ${error.message}`);
      }

      const mappedCoffees = coffees.map((coffee) => ({
        id: coffee.id,
        name: coffee.name,
        price: coffee.price,
        rating: coffee.rating,
        imageUrl: coffee.imageurl,
        category: coffee.category,
        created_at: coffee.created_at,
        updated_at: coffee.updated_at,
        description: coffee.description,
      }));

      return mappedCoffees;
    } catch (error) {
      logger.error(`Error in CoffeeService.getAllCoffees: ${error.message}`);
      throw error;
    }
  }

  async createCoffee(
    supabase,
    name,
    price,
    rating,
    description,
    category,
    imageFile
  ) {
    try {
      const timestamp = Date.now();
      const originalName = imageFile.originalname || "image";
      const extension = originalName.includes(".")
        ? originalName.split(".").pop()
        : "jpg";
      const filePath = `coffees/${timestamp}.${extension}`;

      logger.info(
        `Uploading file to ${filePath}, buffer size: ${imageFile.buffer.length} bytes, MIME type: ${imageFile.mimetype}`
      );

      const contentType = imageFile.mimetype || "image/jpeg";
      const imageUrl = await storageService.uploadFile(
        supabase,
        "coffee-images",
        filePath,
        imageFile.buffer,
        contentType
      );

      const { data: coffee, error: insertError } = await supabase
        .from("coffees")
        .insert([
          {
            name,
            price,
            rating,
            imageurl: imageUrl,
            category,
            description,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create coffee: ${insertError.message}`);
      }

      const mappedCoffee = {
        id: coffee.id,
        name: coffee.name,
        price: coffee.price,
        rating: coffee.rating,
        imageUrl: coffee.imageurl,
        category: coffee.category,
        created_at: coffee.created_at,
        updated_at: coffee.updated_at,
        description: coffee.description,
      };

      return mappedCoffee;
    } catch (error) {
      logger.error(`Error in CoffeeService.createCoffee: ${error.message}`);
      throw error;
    }
  }

  async updateCoffee(
    supabase,
    id,
    name,
    price,
    description,
    rating,
    category,
    imageFile
  ) {
    try {
      const { data: existingCoffee, error: fetchError } = await supabase
        .from("coffees")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existingCoffee) {
        return null;
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = price;
      if (rating !== undefined) updates.rating = rating;
      if (category !== undefined) updates.category = category;
      if (description !== undefined) updates.description = description;

      let imageUrl = existingCoffee.imageurl;
      if (imageFile) {
        const timestamp = Date.now();
        const extension = imageFile.originalname.split(".").pop() || "jpg";
        const filePath = `coffees/${timestamp}.${extension}`;
        const contentType = imageFile.mimetype || "image/jpeg";
        imageUrl = await storageService.uploadFile(
          supabase,
          "coffee-images",
          filePath,
          imageFile.buffer,
          contentType
        );
        updates.imageurl = imageUrl;
      }

      const { data: updatedCoffee, error: updateError } = await supabase
        .from("coffees")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update coffee: ${updateError.message}`);
      }

      return {
        id: updatedCoffee.id,
        name: updatedCoffee.name,
        price: updatedCoffee.price,
        rating: updatedCoffee.rating,
        imageUrl: updatedCoffee.imageurl,
        category: updatedCoffee.category,
        created_at: updatedCoffee.created_at,
        updated_at: updatedCoffee.updated_at,
        description: updatedCoffee.description,
      };
    } catch (error) {
      logger.error(`Error in CoffeeService.updateCoffee: ${error.message}`);
      throw error;
    }
  }

  async deleteCoffee(supabase, id) {
    try {
      const { data, error } = await supabase
        .from("coffees")
        .delete()
        .eq("id", id)
        .select()
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error in CoffeeService.deleteCoffee: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CoffeeService();

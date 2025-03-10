#!/usr/bin/env node

const { program } = require("commander");
const inquirer = require("inquirer");
const { createClient } = require("@supabase/supabase-js");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env"
  );
  console.log("Loaded values:", { supabaseUrl, supabaseAnonKey });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

program
  .version("1.0.0")
  .description("Coffee Shop Admin CLI for managing coffee items");

program
  .command("add-coffee")
  .description("Add a new coffee item")
  .action(async () => {
    try {
      console.log("Starting add-coffee command...");
      console.log("Supabase client initialized with URL:", supabaseUrl);

      const { email } = await inquirer.prompt([
        {
          type: "input",
          name: "email",
          message: "Enter your admin email:",
          validate: (input) => (input ? true : "Email is required"),
        },
      ]);

      let password;
      let confirmed = false;
      while (!confirmed) {
        const { pwd } = await inquirer.prompt([
          {
            type: "password",
            name: "pwd",
            message: `Please enter admin password for ${email}:`,
            mask: "*",
            validate: (input) => (input ? true : "Password is required"),
          },
        ]);
        password = pwd;

        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: "Confirm password (yes/no):",
            default: false,
          },
        ]);
        confirmed = confirm;
        if (!confirmed) {
          console.log("Password confirmation failed. Please try again.");
        }
      }

      console.log("Authenticating with email and password...", { email });

      let loginResponse;
      try {
        loginResponse = await axios.post(
          "https://loffy.onrender.com/api/auth/login",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        if (error.response) {
          throw new Error(
            `Authentication failed: ${
              error.response.data.message || "Invalid credentials"
            }`
          );
        }
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (
        !loginResponse.data.success ||
        !loginResponse.data.data ||
        !loginResponse.data.data.token
      ) {
        throw new Error("Authentication failed: No token returned");
      }

      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log("Received token:", token);
      console.log("User:", user);

      if (user.role !== "admin") {
        throw new Error("Access denied: Admin role required");
      }

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Enter coffee name:",
          validate: (input) => (input ? true : "Name is required"),
        },
        {
          type: "input",
          name: "price",
          message: "Enter price (e.g., 5.99):",
          validate: (imagePath) =>
            !isNaN(parseFloat(imagePath)) && parseFloat(imagePath) > 0
              ? true
              : "Price must be a positive number",
        },
        {
          type: "input",
          name: "rating",
          message: "Enter rating (e.g., 4.5):",
          validate: (input) =>
            !isNaN(parseFloat(input)) &&
            parseFloat(input) >= 0 &&
            parseFloat(input) <= 5
              ? true
              : "Rating must be a number between 0 and 5",
        },
        {
          type: "input",
          name: "category",
          message: "Enter category (e.g., Espresso):",
          validate: (input) => (input ? true : "Category is required"),
        },
        {
          type: "input",
          name: "imagePath",
          message: "Enter path to image file (e.g., ./image.jpg):",
          validate: (input) =>
            fs.existsSync(input) ? true : "File does not exist",
        },
      ]);

      const { name, price, rating, category, imagePath } = answers;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("rating", rating);
      formData.append("category", category);
      formData.append("image", fs.createReadStream(imagePath));

      const coffeesResponse = await axios.post(
        "https://loffy.onrender.com/api/coffees",
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!coffeesResponse.data.success) {
        throw new Error(
          `Failed to add coffee: ${
            coffeesResponse.data.message || "Unknown error"
          }`
        );
      }

      console.log("Coffee item added successfully:", coffeesResponse.data.data);
    } catch (error) {
      console.error("Error:", error.message);
      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  });

program
  .command("update-coffee")
  .description("Update an existing coffee item")
  .action(async () => {
    try {
      console.log("Starting update-coffee command...");
      console.log("Supabase client initialized with URL:", supabaseUrl);

      const { email } = await inquirer.prompt([
        {
          type: "input",
          name: "email",
          message: "Enter your admin email:",
          validate: (input) => (input ? true : "Email is required"),
        },
      ]);

      let password;
      let confirmed = false;
      while (!confirmed) {
        const { pwd } = await inquirer.prompt([
          {
            type: "password",
            name: "pwd",
            message: `Please enter admin password for ${email}:`,
            mask: "*",
            validate: (input) => (input ? true : "Password is required"),
          },
        ]);
        password = pwd;

        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: "Confirm password (yes/no):",
            default: false,
          },
        ]);
        confirmed = confirm;
        if (!confirmed) {
          console.log("Password confirmation failed. Please try again.");
        }
      }

      console.log("Authenticating with email and password...", { email });

      let loginResponse;
      try {
        loginResponse = await axios.post(
          "https://loffy.onrender.com/api/auth/login",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        if (error.response) {
          throw new Error(
            `Authentication failed: ${
              error.response.data.message || "Invalid credentials"
            }`
          );
        }
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (
        !loginResponse.data.success ||
        !loginResponse.data.data ||
        !loginResponse.data.data.token
      ) {
        throw new Error("Authentication failed: No token returned");
      }

      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log("Received token:", token);
      console.log("User:", user);

      if (user.role !== "admin") {
        throw new Error("Access denied: Admin role required");
      }

      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "id",
          message: "Enter coffee ID to update:",
          validate: (input) =>
            !isNaN(parseInt(input)) ? true : "ID must be a number",
        },
        {
          type: "input",
          name: "name",
          message: "Enter new coffee name (press Enter to skip):",
          default: "",
        },
        {
          type: "input",
          name: "price",
          message: "Enter new price (e.g., 5.99, press Enter to skip):",
          validate: (input) =>
            input === "" || (!isNaN(parseFloat(input)) && parseFloat(input) > 0)
              ? true
              : "Price must be a positive number or empty",
          default: "",
        },
        {
          type: "input",
          name: "rating",
          message: "Enter new rating (e.g., 4.5, press Enter to skip):",
          validate: (input) =>
            input === "" ||
            (!isNaN(parseFloat(input)) &&
              parseFloat(input) >= 0 &&
              parseFloat(input) <= 5)
              ? true
              : "Rating must be a number between 0 and 5 or empty",
          default: "",
        },
        {
          type: "input",
          name: "category",
          message: "Enter new category (e.g., Espresso, press Enter to skip):",
          default: "",
        },
        {
          type: "input",
          name: "imagePath",
          message:
            "Enter path to new image file (e.g., ./image.jpg, press Enter to skip):",
          validate: (input) =>
            input === "" || fs.existsSync(input) ? true : "File does not exist",
          default: "",
        },
      ]);

      const { id, name, price, rating, category, imagePath } = answers;

      const formData = new FormData();
      if (name) formData.append("name", name);
      if (price) formData.append("price", price);
      if (rating) formData.append("rating", rating);
      if (category) formData.append("category", category);
      if (imagePath) formData.append("image", fs.createReadStream(imagePath));

      const coffeesResponse = await axios.patch(
        `https://loffy.onrender.com/api/coffees/${id}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!coffeesResponse.data.success) {
        throw new Error(
          `Failed to update coffee: ${
            coffeesResponse.data.message || "Unknown error"
          }`
        );
      }

      console.log(
        "Coffee item updated successfully:",
        coffeesResponse.data.data
      );
    } catch (error) {
      console.error("Error:", error.message);
      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  });

program
  .command("delete-coffee")
  .description("Delete an existing coffee item")
  .action(async () => {
    try {
      console.log("Starting delete-coffee command...");
      console.log("Supabase client initialized with URL:", supabaseUrl);

      const { email } = await inquirer.prompt([
        {
          type: "input",
          name: "email",
          message: "Enter your admin email:",
          validate: (input) => (input ? true : "Email is required"),
        },
      ]);

      let password;
      let confirmed = false;
      while (!confirmed) {
        const { pwd } = await inquirer.prompt([
          {
            type: "password",
            name: "pwd",
            message: `Please enter admin password for ${email}:`,
            mask: "*",
            validate: (input) => (input ? true : "Password is required"),
          },
        ]);
        password = pwd;

        const { confirm } = await inquirer.prompt([
          {
            type: "confirm",
            name: "confirm",
            message: "Confirm password (yes/no):",
            default: false,
          },
        ]);
        confirmed = confirm;
        if (!confirmed) {
          console.log("Password confirmation failed. Please try again.");
        }
      }

      console.log("Authenticating with email and password...", { email });

      let loginResponse;
      try {
        loginResponse = await axios.post(
          "https://loffy.onrender.com/api/auth/login",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        if (error.response) {
          throw new Error(
            `Authentication failed: ${
              error.response.data.message || "Invalid credentials"
            }`
          );
        }
        throw new Error(`Authentication failed: ${error.message}`);
      }

      if (
        !loginResponse.data.success ||
        !loginResponse.data.data ||
        !loginResponse.data.data.token
      ) {
        throw new Error("Authentication failed: No token returned");
      }

      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log("Received token:", token);
      console.log("User:", user);

      if (user.role !== "admin") {
        throw new Error("Access denied: Admin role required");
      }

      const { id } = await inquirer.prompt([
        {
          type: "input",
          name: "id",
          message: "Enter coffee ID to delete:",
          validate: (input) =>
            !isNaN(parseInt(input)) ? true : "ID must be a number",
        },
      ]);

      const coffeesResponse = await axios.delete(
        `https://loffy.onrender.com/api/coffees/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!coffeesResponse.data.success) {
        throw new Error(
          `Failed to delete coffee: ${
            coffeesResponse.data.message || "Unknown error"
          }`
        );
      }

      console.log(
        "Coffee item deleted successfully:",
        coffeesResponse.data.data
      );
    } catch (error) {
      console.error("Error:", error.message);
      if (error.response) {
        console.error("Backend response:", error.response.data);
      }
    }
  });

program.parse(process.argv);

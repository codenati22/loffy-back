const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = "https://iyzjtnsxghhxbquljfyc.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);

    if (error) {
      throw new Error(`Failed to connect to the database: ${error.message}`);
    }

    console.log("Successfully connected to the database");
    console.log("Sample data:", data);
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

testConnection();

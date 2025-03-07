#!/usr/bin/env node

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: "admin@loffy.com",
      password: "mak@Admin",
    });

    if (error) {
      throw new Error("Authentication failed: " + error.message);
    }

    console.log("Session:", session);
    console.log("User:", session.user);
    console.log("Token:", session.access_token);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testAuth();

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const testStorageUpload = async (jwtToken) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    });

    // Read a test image file
    const filePath = path.join(__dirname, "test-image.jpg");
    const fileBuffer = fs.readFileSync(filePath);

    // Log file details for debugging
    console.log("File path:", filePath);
    console.log("File buffer size:", fileBuffer.length, "bytes");
    console.log("Supabase URL:", supabaseUrl);
    console.log("Supabase Key:", supabaseKey);
    console.log("JWT Token:", jwtToken);

    const uploadPath = `test/test-image-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from("coffee-images")
      .upload(uploadPath, fileBuffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });

    if (error) {
      throw new Error(
        `Failed to upload file: ${error.message} (Status: ${error.status}, Code: ${error.code})`
      );
    }

    console.log("Successfully uploaded file:", data);

    const { data: urlData } = supabase.storage
      .from("coffee-images")
      .getPublicUrl(uploadPath);

    console.log("Public URL:", urlData.publicUrl);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const adminJwtToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbG9mZnkuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQxMjYyOTcxLCJleHAiOjE3NDEyNjY1NzF9.E1_rfDpO0wSA_OFmvnPkSx1h1L6mIQtYTA8YYvil93c";
testStorageUpload(adminJwtToken);

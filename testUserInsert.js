const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = "https://iyzjtnsxghhxbquljfyc.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// const testUserInsert = async () => {
//   try {
// const { data: user, error: insertError } = await supabase
//   .from("public.users")
//   .insert([
//     {
//       fullName: "Test User",
//       username: "testuser123",
//       email: "testuser@example.com",
//       phoneNumber: "+1234567890",
//       password: "hashedpassword",
//     },
//   ])
//   .select()
//   .single();

// if (insertError) {
//   throw new Error(`Failed to insert user: ${insertError.message}`);
// }

// console.log("Successfully inserted user:", user);

//     const { data: fetchedUser, error: fetchError } = await supabase
//       .from("users")
//       .select("*");

//     if (fetchError) {
//       throw new Error(`Failed to fetch user: ${fetchError.message}`);
//     }

//     console.log("Successfully fetched user:", fetchedUser);
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };
const testUserInsert = async () => {
  try {
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          fullname: "Test User",
          username: "testuser123",
          email: "testuser@example.com",
          phonenumber: "+1234567890",
          password: "hashedpassword",
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert user: ${insertError.message}`);
    }

    console.log("Successfully inserted user:", user);

    // const { data: fetchedUser, error: fetchError } = await supabase
    //   .from("users")
    //   .select("*");

    // if (fetchError) {
    //   throw new Error(`Failed to fetch user: ${fetchError.message}`);
    // }

    // console.log("Successfully fetched user:", fetchedUser);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
testUserInsert();

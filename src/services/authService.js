const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

class AuthService {
  async register(supabase, fullName, username, email, phoneNumber, password) {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(`Failed to check existing user: ${fetchError.message}`);
      }
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const { data: existingUsername, error: usernameError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (usernameError && usernameError.code !== "PGRST116") {
        throw new Error(`Failed to check username: ${usernameError.message}`);
      }
      if (existingUsername) {
        throw new Error("Username is already taken");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: user, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            fullname: fullName,
            username,
            email,
            phonenumber: phoneNumber,
            password: hashedPassword,
            role: "user",
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create user: ${insertError.message}`);
      }

      const mappedUser = {
        id: user.id,
        fullName: user.fullname,
        username: user.username,
        email: user.email,
        phoneNumber: user.phonenumber,
        password: user.password,
        role: user.role,
        profilePicture: user.profilepicture,
        location: user.location,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { user: mappedUser, token };
    } catch (error) {
      logger.error(`Error in AuthService.register: ${error.message}`);
      throw error;
    }
  }

  async login(supabase, email, password) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError) {
        throw new Error("Invalid email or password");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      const mappedUser = {
        id: user.id,
        fullName: user.fullname,
        username: user.username,
        email: user.email,
        phoneNumber: user.phonenumber,
        password: user.password,
        role: user.role,
        profilePicture: user.profilepicture,
        location: user.location,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { user: mappedUser, token };
    } catch (error) {
      logger.error(`Error in AuthService.login: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AuthService();

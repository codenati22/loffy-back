const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class UserService {
  async getUserProfile(supabase, userId) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          "id, email, fullname, username, phonenumber, location, profilepicture, updated_at"
        )
        .eq("id", userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error(`Error in UserService.getUserProfile: ${error.message}`);
      throw error;
    }
  }

  async updateUserProfile(supabase, userId, updates) {
    try {
      const { fullname, username, phonenumber, location } = updates;
      const { data, error } = await supabase
        .from("users")
        .update({
          fullname,
          username,
          phonenumber,
          location,
          updated_at: new Date(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error(`Error in UserService.updateUserProfile: ${error.message}`);
      throw error;
    }
  }

  async uploadProfilePicture(supabase, userId, file) {
    try {
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${userId}-${uuidv4()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        throw new Error(
          `Failed to upload profile picture: ${uploadError.message}`
        );
      }

      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const profilePictureUrl = urlData.publicUrl;

      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          profilepicture: profilePictureUrl,
          updated_at: new Date(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(
          `Failed to update profile picture URL: ${updateError.message}`
        );
      }

      return data;
    } catch (error) {
      logger.error(
        `Error in UserService.uploadProfilePicture: ${error.message}`
      );
      throw error;
    }
  }

  async changePassword(supabase, userId, currentPassword, newPassword) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("password")
        .eq("id", userId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch user: ${fetchError.message}`);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          password: hashedPassword,
          updated_at: new Date(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to change password: ${updateError.message}`);
      }

      return data;
    } catch (error) {
      logger.error(`Error in UserService.changePassword: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(supabase, email) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError || !user) {
        throw new Error("User not found");
      }

      const resetToken = uuidv4();
      logger.info(`Reset token for ${email}: ${resetToken}`);

      return { resetToken };
    } catch (error) {
      logger.error(`Error in UserService.forgotPassword: ${error.message}`);
      throw error;
    }
  }

  async resetPassword(supabase, resetToken, newPassword) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", 2)
        .single();

      if (fetchError || !user) {
        throw new Error("Invalid or expired reset token");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const { data, error: updateError } = await supabase
        .from("users")
        .update({
          password: hashedPassword,
          updated_at: new Date(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to reset password: ${updateError.message}`);
      }

      return data;
    } catch (error) {
      logger.error(`Error in UserService.resetPassword: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new UserService();

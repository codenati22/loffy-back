const userService = require("../services/userService");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

class UserController {
  constructor() {
    this.getUserProfile = this.getUserProfile.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.uploadProfilePicture = this.uploadProfilePicture.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  async getUserProfile(req, res, next) {
    try {
      console.log("Fetching profile for user:", req.user.userId);
      const profile = await userService.getUserProfile(
        req.supabase,
        req.user.userId
      );
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    try {
      const { fullname, username, phonenumber, location } = req.body;
      if (!fullname && !username && !phonenumber && !location) {
        return res.status(400).json({
          success: false,
          message:
            "At least one field (fullname, username, phonenumber, or location) is required",
        });
      }
      const profile = await userService.updateUserProfile(
        req.supabase,
        req.user.userId,
        {
          fullname,
          username,
          phonenumber,
          location,
        }
      );
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async uploadProfilePicture(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Profile picture file is required",
        });
      }
      const profile = await userService.uploadProfilePicture(
        req.supabase,
        req.user.userId,
        req.file
      );
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "currentPassword and newPassword are required",
        });
      }
      await userService.changePassword(
        req.supabase,
        req.user.userId,
        currentPassword,
        newPassword
      );
      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }
      const { resetToken } = await userService.forgotPassword(
        req.supabase,
        email
      );
      res.status(200).json({
        success: true,
        message:
          "Password reset token generated, mak is back! lol, simulation not applicable in real world",
        data: { resetToken },
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      if (!resetToken || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "resetToken and newPassword are required",
        });
      }
      await userService.resetPassword(req.supabase, resetToken, newPassword);
      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }
}

module.exports = { UserController, upload };

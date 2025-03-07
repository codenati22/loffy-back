const authService = require("../services/authService");

class AuthController {
  async register(req, res, next) {
    try {
      const { fullName, username, email, phoneNumber, password } = req.body;

      if (!fullName || !username || !email || !phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, username, email, phone number, and password are required",
        });
      }

      const { user, token } = await authService.register(
        req.supabase,
        fullName,
        username,
        email,
        phoneNumber,
        password
      );
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      error.statusCode = 400;
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const { user, token } = await authService.login(
        req.supabase,
        email,
        password
      );
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      error.statusCode = 401;
      next(error);
    }
  }
}

module.exports = new AuthController();

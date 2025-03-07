const logger = require("../utils/logger");

const adminMiddleware = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admin privileges required",
      });
    }
    next();
  } catch (error) {
    logger.error(`Error in adminMiddleware: ${error.message}`);
    res.status(403).json({
      success: false,
      message: "Access denied: Admin privileges required",
    });
  }
};

module.exports = adminMiddleware;

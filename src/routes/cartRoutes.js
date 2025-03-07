const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

console.log("Cart routes registered");

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Cart test route works" });
});

router.get("/", authMiddleware, cartController.getCart);
router.post("/", authMiddleware, cartController.addToCart);
router.delete("/:id", authMiddleware, cartController.removeFromCart);

module.exports = router;

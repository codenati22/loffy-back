const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const favoriteController = require("../controllers/favoriteController");

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/", authMiddleware, favoriteController.getFavorites);
router.post("/", authMiddleware, favoriteController.addToFavorites);
router.delete("/:id", authMiddleware, favoriteController.removeFromFavorites);

module.exports = router;

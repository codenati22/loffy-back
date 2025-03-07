const express = require("express");
const router = express.Router();
const multer = require("multer");
const coffeeController = require("../controllers/coffeeController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", (req, res, next) =>
  coffeeController.getAllCoffees(req, res, next)
);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  (req, res, next) => coffeeController.createCoffee(req, res, next)
);
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  (req, res, next) => coffeeController.updateCoffee(req, res, next)
);
router.delete("/:id", authMiddleware, adminMiddleware, (req, res, next) =>
  coffeeController.deleteCoffee(req, res, next)
);

module.exports = router;

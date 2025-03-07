const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { UserController, upload } = require("../controllers/userController");

const userController = new UserController();

router.get("/me", authMiddleware, userController.getUserProfile);
router.put("/me", authMiddleware, userController.updateUserProfile);
router.post(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);
router.post("/change-password", authMiddleware, userController.changePassword);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); // Adjust the path if necessary
const authMiddleware = require("../middlewares/authMiddleware");

// Register a new user
router.post("/register", authController.register);

// Login a user
router.post("/login", authController.login);

// Google login
router.post("/google", authController.googleAuth);

// Change password (Protected route)
router.put("/change-password", authMiddleware(), authController.changePassword);

// Get profile info (Protected route)
router.get("/profile", authMiddleware(), authController.getProfile);

module.exports = router;

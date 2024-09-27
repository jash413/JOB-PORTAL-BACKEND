const express = require("express");
const router = express.Router();
const loginController = require("../controllers/authController"); // Adjust the path if necessary
const authMiddleware = require("../middlewares/authMiddleware");

// Register a new user
router.post("/register", loginController.register);

// Login a user
router.post("/login", loginController.login);

// Get profile info (Protected route)
router.get("/profile", authMiddleware(), loginController.getProfile);

module.exports = router;

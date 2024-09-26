const express = require("express");
const candidateExpController = require("../controllers/candidateExpController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define routes for candidate experience details
router.post("/candidate",authMiddleware,candidateExpController.getExpDetailsByCandidate); // Get all exp details for a candidate
router.get("/:exp_id",authMiddleware, candidateExpController.getExpDetailById); // Get a specific exp detail by exp_id
router.post("/", authMiddleware,candidateExpController.createExpDetail); // Create a new exp detail
router.put("/:exp_id",authMiddleware, candidateExpController.updateExpDetail); // Update an exp detail
router.delete("/:exp_id",authMiddleware, candidateExpController.deleteExpDetail); // Delete an exp detail

module.exports = router;

const express = require("express");
const candidateExpController = require("../controllers/candidateExpController");

const router = express.Router();

// Define routes for candidate experience details
router.post("/candidate",candidateExpController.getExpDetailsByCandidate); // Get all exp details for a candidate
router.get("/:exp_id", candidateExpController.getExpDetailById); // Get a specific exp detail by exp_id
router.post("/", candidateExpController.createExpDetail); // Create a new exp detail
router.put("/:exp_id", candidateExpController.updateExpDetail); // Update an exp detail
router.delete("/:exp_id", candidateExpController.deleteExpDetail); // Delete an exp detail

module.exports = router;

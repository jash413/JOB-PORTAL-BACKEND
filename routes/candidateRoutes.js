// routes/candidateRoutes.js
const express = require("express");
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define the routes
router.post("/get-candidates",authMiddleware, candidateController.getAllCandidates); // Get all candidates
router.get("/:id",authMiddleware, candidateController.getCandidateById); // Get a specific candidate
router.post("/",authMiddleware, candidateController.createCandidate); // Create a new candidate
router.put("/:id",authMiddleware, candidateController.updateCandidate); // Update an existing candidate
router.delete("/:id",authMiddleware, candidateController.deleteCandidate); // Delete a candidate

module.exports = router;

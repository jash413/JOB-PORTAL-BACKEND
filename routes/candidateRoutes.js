// routes/candidateRoutes.js
const express = require("express");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

// Define the routes
router.post("/get-candidates", candidateController.getAllCandidates); // Get all candidates
router.get("/:id", candidateController.getCandidateById); // Get a specific candidate
router.post("/", candidateController.createCandidate); // Create a new candidate
router.put("/:id", candidateController.updateCandidate); // Update an existing candidate
router.delete("/:id", candidateController.deleteCandidate); // Delete a candidate

module.exports = router;

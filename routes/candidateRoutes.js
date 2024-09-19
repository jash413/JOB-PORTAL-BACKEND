// routes/candidateRoutes.js
const express = require("express");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

// Define the routes
router.get("/candidates", candidateController.getAllCandidates); // Get all candidates
router.get("/candidates/:id", candidateController.getCandidateById); // Get a specific candidate
router.post("/candidates", candidateController.createCandidate); // Create a new candidate
router.put("/candidates/:id", candidateController.updateCandidate); // Update an existing candidate
router.delete("/candidates/:id", candidateController.deleteCandidate); // Delete a candidate

module.exports = router;

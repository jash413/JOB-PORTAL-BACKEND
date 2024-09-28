// routes/candidateRoutes.js
const express = require("express");
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define the routes
router.post(
  "/get-candidates",
  authMiddleware(["AMN", "CAN"]),
  candidateController.getAllCandidates
); // Get all candidates
router.get(
  "/:id",
  authMiddleware(["AMN", "CAN"]),
  candidateController.getCandidateById
); // Get a specific candidate
router.post(
  "/",
  authMiddleware(["AMN", "CAN"]),
  candidateController.createCandidate
); // Create a new candidate
router.put(
  "/:id",
  authMiddleware(["AMN", "CAN"]),
  candidateController.updateCandidate
); // Update an existing candidate
router.delete(
  "/:id",
  authMiddleware(["AMN", "CAN"]),
  candidateController.deleteCandidate
); // Delete a candidate

// View job posts (filtered/paginated) from employers who have access to candidate's profile
router.post("/job-posts", candidateController.getJobPosts);

module.exports = router;

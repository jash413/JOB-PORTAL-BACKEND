// routes/candidateRoutes.js
const express = require("express");
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Define the routes
router.post(
  "/get-candidates",
  authMiddleware(["AMN", "CND"]),
  candidateController.getAllCandidates
); // Get all candidates
router.get(
  "/:id",
  authMiddleware(["AMN", "CND", "EMP"]),
  candidateController.getCandidateById
); // Get a specific candidate
router.post(
  "/",
  authMiddleware(["AMN", "CND"]),
  candidateController.createCandidate
); // Create a new candidate
router.put(
  "/",
  authMiddleware(["AMN", "CND"]),
  candidateController.updateCandidate
); // Update an existing candidate
router.delete(
  "/:id",
  authMiddleware(["AMN", "CND"]),
  candidateController.deleteCandidate
); // Delete a candidate
router.get(
  "/:id/profile-image",
  authMiddleware(["AMN", "CND"]),
  candidateController.downloadProfileImage
)
router.get(
  "/:id/resume",
  authMiddleware(["AMN", "CND"]),
  candidateController.downloadResume
)

module.exports = router;

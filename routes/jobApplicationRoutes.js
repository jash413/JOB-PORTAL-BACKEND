// routes/jobApplicationRoutes.js
const express = require("express");
const router = express.Router();
const JobApplicationController = require("../controllers/jobApplicationController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route for candidates to apply for a job
router.post("/apply", authMiddleware([]), JobApplicationController.applyForJob);

// Route to get all applications made by a specific candidate
router.get(
  "/candidate/:candidateId",
  authMiddleware([]),
  JobApplicationController.getCandidateApplications
);

// Route to get all applications for a specific job post (for employers)
router.get(
  "/job/:jobPostId",
  authMiddleware([]),
  JobApplicationController.getJobApplications
);

// Route for employers to update application status (accept/reject)
router.put(
  "/application/:applicationId/status",
  authMiddleware([]),
  JobApplicationController.updateApplicationStatus
);

module.exports = router;

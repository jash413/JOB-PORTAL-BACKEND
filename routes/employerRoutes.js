// routes/employerRoutes.js
const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all employers
router.post(
  "/get-employers",
  authMiddleware(["AMN", "EMP"]),
  employerController.getAllEmployers
);

// Get an employer by ID
router.get(
  "/:id",
  authMiddleware(["AMN", "EMP"]),
  employerController.getEmployerById
);

// Create a new employer
router.post(
  "/",
  authMiddleware(["AMN", "EMP"]),
  employerController.createEmployer
);

// Update an existing employer
router.put(
  "/:id",
  authMiddleware(["AMN", "EMP"]),
  employerController.updateEmployer
);

// Delete an employer by ID
router.delete(
  "/:id",
  authMiddleware(["AMN", "EMP"]),
  employerController.deleteEmployer
);

// Request access to a candidate's profile
router.post("/request-access", employerController.requestAccessToCandidate);

// View approved candidates (filtered/paginated)
router.post("/approved-candidates", employerController.getApprovedCandidates);

module.exports = router;

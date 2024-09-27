const express = require("express");
const router = express.Router();
const educationController = require("../controllers/candidateEduController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all education records for a candidate
router.post(
  "/get-edu-details",
  authMiddleware(["AMN", "CAN"]),
  educationController.getEducationByCandidate
);

// Get a single education record by ID
router.get(
  "/:edu_id",
  authMiddleware(["AMN", "CAN"]),
  educationController.getEducationById
);

// Create a new education record
router.post(
  "/",
  authMiddleware(["AMN", "CAN"]),
  educationController.createEducation
);

// Update an education record by ID
router.put(
  "/:edu_id",
  authMiddleware(["AMN", "CAN"]),
  educationController.updateEducation
);

// Delete an education record by ID
router.delete(
  "/:edu_id",
  authMiddleware(["AMN", "CAN"]),
  educationController.deleteEducation
);

module.exports = router;

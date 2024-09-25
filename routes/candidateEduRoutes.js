const express = require("express");
const router = express.Router();
const educationController = require("../controllers/candidateEduController");

// Get all education records for a candidate
router.post("/get-edu-details", educationController.getEducationByCandidate);

// Get a single education record by ID
router.get("/education/:edu_id", educationController.getEducationById);

// Create a new education record
router.post("/", educationController.createEducation);

// Update an education record by ID
router.put("/education/:edu_id", educationController.updateEducation);

// Delete an education record by ID
router.delete("/education/:edu_id", educationController.deleteEducation);

module.exports = router;

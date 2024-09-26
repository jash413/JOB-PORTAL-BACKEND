const express = require("express");
const router = express.Router();
const educationController = require("../controllers/candidateEduController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all education records for a candidate
router.post("/get-edu-details",authMiddleware, educationController.getEducationByCandidate);

// Get a single education record by ID
router.get("/education/:edu_id",authMiddleware, educationController.getEducationById);

// Create a new education record
router.post("/",authMiddleware, educationController.createEducation);

// Update an education record by ID
router.put("/education/:edu_id",authMiddleware, educationController.updateEducation);

// Delete an education record by ID
router.delete("/education/:edu_id",authMiddleware, educationController.deleteEducation);

module.exports = router;

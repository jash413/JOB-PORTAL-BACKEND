// routes/employerRoutes.js
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const authMiddleware = require("../middlewares/authMiddleware");

// Get all employers
router.post('/get-employers',authMiddleware, employerController.getAllEmployers);

// Get an employer by ID
router.get('/:id',authMiddleware, employerController.getEmployerById);

// Create a new employer
router.post('/',authMiddleware, employerController.createEmployer);

// Update an existing employer
router.put('/:id',authMiddleware, employerController.updateEmployer);

// Delete an employer by ID
router.delete('/:id',authMiddleware, employerController.deleteEmployer);

module.exports = router;

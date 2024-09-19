// routes/employerRoutes.js
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

// Get all employers
router.get('/employers', employerController.getAllEmployers);

// Get an employer by ID
router.get('/employers/:id', employerController.getEmployerById);

// Create a new employer
router.post('/employers', employerController.createEmployer);

// Update an existing employer
router.put('/employers/:id', employerController.updateEmployer);

// Delete an employer by ID
router.delete('/employers/:id', employerController.deleteEmployer);

module.exports = router;

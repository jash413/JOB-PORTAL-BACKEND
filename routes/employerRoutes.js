// routes/employerRoutes.js
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');

// Get all employers
router.post('/get-employers', employerController.getAllEmployers);

// Get an employer by ID
router.get('/:id', employerController.getEmployerById);

// Create a new employer
router.post('/', employerController.createEmployer);

// Update an existing employer
router.put('/:id', employerController.updateEmployer);

// Delete an employer by ID
router.delete('/:id', employerController.deleteEmployer);

module.exports = router;

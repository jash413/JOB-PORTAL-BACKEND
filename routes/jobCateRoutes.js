// routes/jobCateRoutes.js
const express = require('express');
const router = express.Router();
const jobCateController = require('../controllers/jobCateController');

// Get all job categories
router.get('/job-categories', jobCateController.getAllJobCategories);

// Get a single job category by cate_code
router.get('/job-categories/:id', jobCateController.getJobCategoryById);

// Create a new job category
router.post('/job-categories', jobCateController.createJobCategory);

// Update a job category by cate_code
router.put('/job-categories/:id', jobCateController.updateJobCategory);

// Delete a job category by cate_code
router.delete('/job-categories/:id', jobCateController.deleteJobCategory);

module.exports = router;

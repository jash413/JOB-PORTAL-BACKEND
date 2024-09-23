// routes/jobCateRoutes.js
const express = require('express');
const router = express.Router();
const jobCateController = require('../controllers/jobCateController');

// Get all job categories
router.post('/get-job-categories', jobCateController.getAllJobCategories);

// Get a single job category by cate_code
router.get('/:id', jobCateController.getJobCategoryById);

// Create a new job category
router.post('/', jobCateController.createJobCategory);

// Update a job category by cate_code
router.put('/:id', jobCateController.updateJobCategory);

// Delete a job category by cate_code
router.delete('/:id', jobCateController.deleteJobCategory);

module.exports = router;

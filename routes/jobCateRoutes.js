// routes/jobCateRoutes.js
const express = require('express');
const router = express.Router();
const jobCateController = require('../controllers/jobCateController');
const authMiddleware = require("../middlewares/authMiddleware");

// Get all job categories
router.post('/get-job-categories',authMiddleware, jobCateController.getAllJobCategories);

// Get a single job category by cate_code
router.get('/:id',authMiddleware, jobCateController.getJobCategoryById);

// Create a new job category
router.post('/',authMiddleware, jobCateController.createJobCategory);

// Update a job category by cate_code
router.put('/:id',authMiddleware, jobCateController.updateJobCategory);

// Delete a job category by cate_code
router.delete('/:id',authMiddleware, jobCateController.deleteJobCategory);

module.exports = router;

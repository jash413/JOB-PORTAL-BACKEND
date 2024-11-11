// routes/jobCateRoutes.js
const express = require("express");
const router = express.Router();
const jobCateController = require("../controllers/jobCateController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get all job categories
router.post(
  "/get-job-categories",
  authMiddleware(["AMN","CND","EMP"]),
  jobCateController.getAllJobCategories
);

// Get a single job category by cate_code
router.get("/:id", authMiddleware(["AMN"]), jobCateController.getJobCategoryById);

// Create a new job category
router.post("/", authMiddleware(["AMN"]), jobCateController.createJobCategory);

// Update a job category by cate_code
router.put("/:id", authMiddleware(["AMN"]), jobCateController.updateJobCategory);

// Delete a job category by cate_code
router.delete("/:id", authMiddleware(["AMN"]), jobCateController.deleteJobCategory);

module.exports = router;

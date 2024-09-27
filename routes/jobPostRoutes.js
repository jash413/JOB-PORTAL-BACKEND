const express = require("express");
const jobPostController = require("../controllers/jobPostController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/job-posts",
  authMiddleware(["EMP"]),
  jobPostController.createJobPost
);
router.post(
  "/job-posts/get-job-posts",
  authMiddleware(["EMP"]),
  jobPostController.getAllJobPosts
);
router.get(
  "/job-posts/:id",
  authMiddleware(["EMP"]),
  jobPostController.getJobPostById
);
router.put(
  "/job-posts/:id",
  authMiddleware(["EMP"]),
  jobPostController.updateJobPost
);
router.delete(
  "/job-posts/:id",
  authMiddleware(["EMP"]),
  jobPostController.deleteJobPost
);

module.exports = router;

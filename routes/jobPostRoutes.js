const express = require("express");
const jobPostController = require("../controllers/jobPostController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware(["EMP"]),
  jobPostController.createJobPost
);
router.post(
  "/get-job-posts",
  authMiddleware(["EMP"]),
  jobPostController.getAllJobPosts
);
router.get(
  "/:id",
  authMiddleware(["EMP"]),
  jobPostController.getJobPostById
);
router.put(
  "/:id",
  authMiddleware(["EMP"]),
  jobPostController.updateJobPost
);
router.delete(
  "/:id",
  authMiddleware(["EMP"]),
  jobPostController.deleteJobPost
);

module.exports = router;

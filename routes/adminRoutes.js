// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Get all pending access requests
router.post("/access-requests", adminController.getRequests);

// Approve an access request
router.put(
  "/access-requests/:id/approve",
  adminController.approveAccessRequest
);

// Deny an access request
router.put("/access-requests/:id/deny", adminController.denyAccessRequest);

// Update user approval status
router.put(
  "/users/:id/approval-status",
  adminController.updateUserApprovalStatus
);

// Grant profile access to a employer
router.post("/grant-profile-access", adminController.grantProfileAccess);

// Revoke profile access from a employer
router.post("/revoke-profile-access", adminController.revokeProfileAccess);

// Update job post access
router.post("/update-job-post-access", adminController.updateJobPostAccess);

// Get all profile access
router.get("/profile-access", adminController.getProfileAccess);

// Get all candidate with profile access to a employer
router.post(
  "/candidates-with-profile-access",
  adminController.getCandidatesWithProfileAccess
);

// Get all candidates
router.post("/candidates", adminController.getCandidates);

// Get all employers
router.post("/employers", adminController.getEmployers);

// Get not accessible candidates
router.post(
  "/get-not-accessible-candidates",
  adminController.getCandidatesNotAccessibleToEmployer
);

// Get all job posts
router.post("/job-posts", adminController.getJobPosts);

// Get all job posts with no access granted to candidate
router.post(
  "/get-job-posts-with-no-access-granted-to-candidates",
  adminController.getJobPostsWithNoAccess
);

// Get employer by id
router.get("/employers/:id", adminController.getEmployerById);

module.exports = router;

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

// Add job post access to a candidate
router.post("/job-post-access", adminController.addJobPostAccess);

// Remove job post access from a candidate
router.delete("/job-post-access", adminController.removeJobPostAccess);

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

// Get all job posts
router.get("/job-posts", adminController.getJobPosts);

// Get employer by id
router.get("/employers/:id", adminController.getEmployerById);

module.exports = router;

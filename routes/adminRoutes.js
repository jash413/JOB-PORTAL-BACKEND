// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Get all pending access requests
router.post('/access-requests', adminController.getRequests);

// Approve an access request
router.put('/access-requests/:id/approve', adminController.approveAccessRequest);

// Deny an access request
router.put('/access-requests/:id/deny', adminController.denyAccessRequest);

// Add job post access to a candidate
router.post('/job-post-access', adminController.addJobPostAccess);

// Remove job post access from a candidate
router.delete('/job-post-access', adminController.removeJobPostAccess);

module.exports = router;

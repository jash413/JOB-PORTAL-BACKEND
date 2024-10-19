// controllers/adminController.js
const Employer = require("../models/employer");
const Candidate = require("../models/candidate");
const AccessRequest = require("../models/accessRequest");
const ProfileAccess = require("../models/profileAccess");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * tags:
 *  name: Admin
 *  description: API for admin operations
 */

/**
 * @swagger
 * /api/v1/admin/access-requests:
 *   post:
 *     summary: Retrieve a list of access requests (filterable, searchable, paginated)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 description: Fields to filter by
 *                 properties:
 *                   status:
 *                     type: string
 *                     description: Filter by request status (e.g., pending, approved, rejected)
 *               search:
 *                 type: string
 *                 description: Search string for partial matches in employer or candidate names
 *               sort:
 *                 type: object
 *                 description: Fields to sort by
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: The field to sort by (e.g., requestedAt)
 *                   order:
 *                     type: string
 *                     enum: [asc, desc]
 *                     description: The sort order (asc for ascending, desc for descending)
 *               pagination:
 *                 type: object
 *                 description: Pagination options
 *                 properties:
 *                   page:
 *                     type: integer
 *                   pageSize:
 *                     type: integer
 *     responses:
 *       200:
 *         description: List of access requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Access request ID
 *                       employerId:
 *                         type: integer
 *                         description: Employer ID
 *                       candidateId:
 *                         type: integer
 *                         description: Candidate ID
 *                       status:
 *                         type: string
 *                         description: Request status (pending, approved, rejected)
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the request was made
 *                       reviewedAt:
 *                         type: string
 *                         format: date-time
 *                         description: When the request was reviewed (if applicable)
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     pageSize:
 *                       type: integer
 *                       description: Number of items per page
 *       500:
 *         description: Error fetching access requests
 */
exports.getRequests = async (req, res) => {
  try {
    const includeModels = [
      {
        model: Employer,
        as: "Employer",
        attributes: ["cmp_name"],
      },
      {
        model: Candidate,
        as: "Candidate",
        attributes: ["can_name"],
      },
    ];
    const standardFields = ["status"];
    const searchFields = ["Employer.cmp_name", "Candidate.can_name"];
    const allowedSortFields = ["requestedAt"];

    const aggregatedData = await aggregateData({
      baseModel: AccessRequest,
      includeModels,
      body: req.body,
      standardFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching pending requests", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/access-requests/{id}/approve:
 *   put:
 *     summary: Approve an access request for an employer to view a candidate's profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access request ID
 *     responses:
 *       200:
 *         description: Access request approved and access granted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or already processed request
 *       500:
 *         description: Error approving request
 */
exports.approveAccessRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await AccessRequest.findByPk(id);

    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed request" });
    }

    request.status = "approved";
    request.reviewedAt = new Date();
    await request.save();

    await ProfileAccess.create({
      employerId: request.employerId,
      candidateId: request.candidateId,
    });

    res
      .status(200)
      .json({ message: "Access request approved and access granted." });
  } catch (error) {
    res.status(500).json({ message: "Error approving request", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/access-requests/{id}/deny:
 *   put:
 *     summary: Deny an access request for an employer to view a candidate's profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Access request ID
 *     responses:
 *       200:
 *         description: Access request denied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or already processed request
 *       500:
 *         description: Error denying request
 */
exports.denyAccessRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await AccessRequest.findByPk(id);

    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or already processed request" });
    }

    request.status = "rejected";
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({ message: "Access request denied." });
  } catch (error) {
    res.status(500).json({ message: "Error denying request", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/grant-profile-access:
 *   post:
 *     summary: Grant access to a candidate's profile for a specific employer
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerId:
 *                 type: integer
 *                 description: Employer ID requesting access
 *               candidateId:
 *                 type: integer
 *                 description: Candidate ID for whom access is requested
 *     responses:
 *       200:
 *         description: Profile access granted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Access already granted to this candidate
 *       500:
 *         description: Error granting profile access
 */
exports.grantProfileAccess = async (req, res) => {
  const { employerId, candidateId } = req.body;
  try {
    const existingAccess = await ProfileAccess.findOne({
      where: { employerId, candidateId },
    });

    if (existingAccess) {
      return res
        .status(400)
        .json({ message: "Access already granted to this candidate" });
    }

    await ProfileAccess.create({ employerId, candidateId });

    res.status(200).json({ message: "Profile access granted" });
  } catch (error) {
    res.status(500).json({ message: "Error granting profile access", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/job-post-access:
 *   post:
 *     summary: Add job post access for a candidate
 *     description: Grants access to a specific job post for a candidate who already has profile access
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employerId
 *               - candidateId
 *               - jobPostId
 *             properties:
 *               employerId:
 *                 type: string
 *                 description: ID of the employer granting access
 *               candidateId:
 *                 type: string
 *                 description: ID of the candidate receiving access
 *               jobPostId:
 *                 type: string
 *                 description: ID of the job post to grant access to
 *     responses:
 *       200:
 *         description: Job post access granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job post access granted
 *       400:
 *         description: Access not granted to the candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access not granted to this candidate
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error granting job post access
 *                 error:
 *                   type: object
 *                   description: Error object
 */
exports.addJobPostAccess = async (req, res) => {
  const { employerId, candidateId, jobPostId } = req.body;
  try {
    const accessRequest = await ProfileAccess.findOne({
      where: { employerId, candidateId },
    });

    if (!accessRequest) {
      return res
        .status(400)
        .json({ message: "Access not granted to this candidate" });
    }

    accessRequest.accessibleJobPostsByCandidate.push(jobPostId);
    await accessRequest.save();

    res.status(200).json({ message: "Job post access granted" });
  } catch (error) {
    res.status(500).json({ message: "Error granting job post access", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/job-post-access:
 *   delete:
 *     summary: Remove job post access for a candidate
 *     description: Revokes access to a specific job post for a candidate
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employerId
 *               - candidateId
 *               - jobPostId
 *             properties:
 *               employerId:
 *                 type: string
 *                 description: ID of the employer revoking access
 *               candidateId:
 *                 type: string
 *                 description: ID of the candidate losing access
 *               jobPostId:
 *                 type: string
 *                 description: ID of the job post to revoke access from
 *     responses:
 *       200:
 *         description: Job post access removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job post access removed
 *       400:
 *         description: Access not granted to the candidate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access not granted to this candidate
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error removing job post access
 *                 error:
 *                   type: object
 *                   description: Error object
 */
exports.removeJobPostAccess = async (req, res) => {
  const { employerId, candidateId, jobPostId } = req.body;
  try {
    const accessRequest = await ProfileAccess.findOne({
      where: { employerId, candidateId },
    });

    if (!accessRequest) {
      return res
        .status(400)
        .json({ message: "Access not granted to this candidate" });
    }

    accessRequest.accessibleJobPostsByCandidate = accessRequest.accessibleJobPostsByCandidate.filter(
      (id) => id !== jobPostId
    );
    await accessRequest.save();

    res.status(200).json({ message: "Job post access removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing job post access", error });
  }
};

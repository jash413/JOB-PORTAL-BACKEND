// controllers/adminController.js
const Employer = require("../models/employer");
const Candidate = require("../models/candidate");
const AccessRequest = require("../models/accessRequest");
const ProfileAccess = require("../models/profileAccess");
const JobPost = require("../models/jobPost");
const Login = require("../models/loginMast");
const JobCate = require("../models/jobCate");
const CandidateEducation = require("../models/candidateEdu");
const CandidateExperience = require("../models/candidateExpDetails");
const { Op } = require("sequelize");
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
 *     summary: Retrieve a list of access requests with dynamic filters, sorting, searching, and pagination
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: cmp_name
 *                 enum: [cmp_name, emp_loca]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for company name or location(city)
 *                 example: webwise solution
 *               employerId:
 *                 type: integer
 *                 description: Employer ID to filter access requests
 *                 example: 123
 *     responses:
 *       200:
 *         description: List of access request with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Current page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching employers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
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
        attributes: ["can_name", "can_code"],
        include: [
          {
            model: JobCate,
            as: "job_category",
            attributes: ["cate_desc"],
          },
        ],
      },
    ];
    const standardFields = ["status", "employerId"];
    const searchFields = [];
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

    // If profile access already exists, do nothing
    const existingAccess = await ProfileAccess.findOne({
      where: {
        employerId: request.employerId,
        candidateId: request.candidateId,
      },
    });

    if (existingAccess) {
      return res
        .status(200)
        .json({ message: "Access request approved and access granted." });
    }

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

    // If profile access already exists, revoke it
    const existingAccess = await ProfileAccess.findOne({
      where: {
        employerId: request.employerId,
        candidateId: request.candidateId,
      },
    });

    if (existingAccess) {
      await ProfileAccess.destroy({
        where: {
          employerId: request.employerId,
          candidateId: request.candidateId,
        },
      });
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

    // Find access requests for the employer and candidate
    const accessRequest = await AccessRequest.findOne({
      where: { employerId, candidateId },
    });

    if (accessRequest) {
      accessRequest.status = "approved";
      accessRequest.reviewedAt = new Date();
      await accessRequest.save();
    } else {
      // Create a new access request if it doesn't exist
      await AccessRequest.create({
        employerId,
        candidateId,
        status: "approved",
      });
    }

    await ProfileAccess.create({ employerId, candidateId });

    res.status(200).json({ message: "Profile access granted" });
  } catch (error) {
    res.status(500).json({ message: "Error granting profile access", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/revoke-profile-access:
 *   post:
 *     summary: Revoke access to a candidate's profile for a specific employer
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employerId:
 *                 type: integer
 *                 description: Employer ID revoking access
 *                 example: 123
 *               candidateId:
 *                 type: integer
 *                 description: Candidate ID for whom access is revoked
 *                 example: 456
 *     responses:
 *       200:
 *         description: Profile access revoked.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile access successfully revoked."
 *       400:
 *         description: Access not granted to the candidate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access not granted to the candidate."
 *       500:
 *         description: Error revoking profile access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error revoking profile access."
 *                 error:
 *                   type: object
 *                   description: Detailed error information
 *                   example: { "code": "ERR_REVOKE_ACCESS", "details": "Database connection failed." }
 */
exports.revokeProfileAccess = async (req, res) => {
  const { employerId, candidateId } = req.body;
  try {
    const existingAccess = await ProfileAccess.findOne({
      where: { employerId, candidateId },
    });

    if (!existingAccess) {
      return res
        .status(400)
        .json({ message: "Access not granted to this candidate" });
    }

    // Find access requests for the employer and candidate
    const accessRequest = await AccessRequest.findOne({
      where: { employerId, candidateId },
    });

    if (accessRequest) {
      accessRequest.status = "rejected";
      accessRequest.reviewedAt = new Date();
      await accessRequest.save();
    }

    await ProfileAccess.destroy({ where: { employerId, candidateId } });

    res.status(200).json({ message: "Profile access revoked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error revoking profile access", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/update-job-post-access:
 *   post:
 *     summary: Update job post access for candidates
 *     description: Grants job post access to specified candidates and removes access from all other candidates of the employer for this job post
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employerId
 *               - candidateIds
 *               - jobPostId
 *             properties:
 *               employerId:
 *                 type: string
 *                 description: ID of the employer managing job post access
 *               candidateIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of candidate IDs to receive job post access
 *               jobPostId:
 *                 type: string
 *                 description: ID of the job post to manage access for
 *     responses:
 *       200:
 *         description: Job post access updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job post access updated successfully
 *                 updatedCandidates:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Validation error or partial update failure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 failedCandidates:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: object
 */
exports.updateJobPostAccess = async (req, res) => {
  const { employerId, candidateIds, jobPostId } = req.body;

  // Validate input
  if (!employerId || !candidateIds || !jobPostId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Fetch all access requests for the employer
    const allAccessRequests = await ProfileAccess.findAll({
      where: { employerId },
    });

    // Track candidates who were successfully updated
    const updatedCandidates = [];

    // Process each access request
    for (const accessRequest of allAccessRequests) {
      const { candidateId, accessibleJobPostsByCandidate } = accessRequest;

      // Check if the candidate is in the provided list
      const isCandidateInList = candidateIds.includes(candidateId);

      if (isCandidateInList) {
        // Check if the job post is already accessible
        const hasJobPostAccess =
          accessibleJobPostsByCandidate.includes(jobPostId);

        if (!hasJobPostAccess) {
          // Add job post access if not already present
          accessibleJobPostsByCandidate.push(jobPostId);

          // Update the access request
          await ProfileAccess.update(
            { accessibleJobPostsByCandidate },
            { where: { employerId, candidateId } }
          );

          updatedCandidates.push(candidateId);
        }
      } else {
        // Remove job post access for candidates not in the list
        const updatedJobPosts = accessibleJobPostsByCandidate.filter(
          (id) => id !== jobPostId
        );

        if (updatedJobPosts.length !== accessibleJobPostsByCandidate.length) {
          // Update only if there was a change
          await ProfileAccess.update(
            { accessibleJobPostsByCandidate: updatedJobPosts },
            { where: { employerId, candidateId } }
          );
        }
      }
    }

    // Return success response
    res.status(200).json({
      message: "Job post access updated successfully",
      updatedCandidates,
    });
  } catch (error) {
    // Handle errors gracefully
    res.status(500).json({
      message: "Error updating job post access",
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/v1/admin/profile-access:
 *   post:
 *     summary: Retrieve a list of profile access with dynamic filters, sorting, searching, and pagination
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for company name or candidate name
 *                 example: webwise solution
 *     responses:
 *       200:
 *         description: List of profile access with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching profile access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
exports.getProfileAccess = async (req, res) => {
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
    const standardFields = ["createdAt"];
    const searchFields = [];
    const allowedSortFields = ["createdAt"];

    const aggregatedData = await aggregateData({
      baseModel: ProfileAccess,
      includeModels,
      body: req.body,
      standardFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching profile access", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/candidates-with-profile-access:
 *   post:
 *     summary: Retrieve a list of candidates with profile access for an employer
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for company name or candidate name
 *                 example: webwise solution
 *               employerId:
 *                type: integer
 *                description: Employer ID to filter candidates by profile access
 *                example: 123
 *     responses:
 *       200:
 *         description: List of candidates with profile access for an employer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching candidates"
 */
exports.getCandidatesWithProfileAccess = async (req, res) => {
  try {
    const { body } = req;

    const candidates = await aggregateData({
      baseModel: ProfileAccess,
      includeModels: [
        {
          model: Candidate,
          as: "Candidate",
          attributes: ["can_name", "can_code"],
        },
      ],
      body,
      standardFields: ["createdAt", "employerId"],
      searchFields: [],
      allowedSortFields: ["createdAt"],
    });

    res.status(200).json(candidates);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/candidates:
 *   post:
 *     summary: Retrieve a list of candidates with dynamic filters, sorting, searching, and pagination
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for candidate name or code
 *                 example: John Doe
 *               can_code:
 *                 type: integer
 *                 description: Candidate code to filter candidates
 *                 example: 123
 *               open_to_job:
 *                 type: boolean
 *                 description: Filter candidates open to job opportunities
 *                 example: 1
 *               user_approval_status:
 *                 type: boolean
 *                 description: Filter candidates by user approval status
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of candidates with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching candidates."
 */
exports.getCandidates = async (req, res) => {
  try {
    // Filter candidates by user approval status
    if (
      req.body.user_approval_status === 0 ||
      req.body.user_approval_status === 1
    ) {
      // Fetch logins with user_approval_status
      const logins = await Login.findAll({
        where: {
          user_approval_status: req.body.user_approval_status,
          login_type: "CND",
        },
        attributes: ["login_id"],
        raw: true,
      });

      // Extract login IDs
      const loginIds = logins.map((login) => login.login_id);

      // Add login IDs to search criteria
      req.body.login_id = loginIds;
    }

    const candidates = await aggregateData({
      baseModel: Candidate,
      includeModels: [
        {
          model: Login,
          as: "Login",
          attributes: [
            "login_name",
            "login_email",
            "login_mobile",
            "user_approval_status",
          ],
        },
        {
          model: JobCate,
          as: "job_category",
          attributes: ["cate_desc"],
        },
        {
          model: CandidateEducation,
          as: "candidate_edu",
          attributes: [
            "can_edu",
            "can_scho",
            "can_pasy",
            "can_perc",
            "can_stre",
            "can_cgpa",
          ],
        },
        {
          model: CandidateExperience,
          as: "candidate_exp",
          attributes: [
            "emp_name",
            "exp_type",
            "exp_desg",
            "cur_ctc",
            "job_stdt",
            "job_endt",
          ],
        },
      ],
      body: req.body,
      standardFields: ["createdAt", "can_code", "open_to_job", "login_id"],
      searchFields: ["can_name"],
      allowedSortFields: ["createdAt"],
    });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/employers:
 *   post:
 *     summary: Retrieve a list of employers with dynamic filters, sorting, searching, and pagination
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for candidate name or code
 *                 example: John Doe
 *               user_approval_status:
 *                 type: boolean
 *                 description: Filter employers by user approval status
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of employers with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching employers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching employers."
 */
exports.getEmployers = async (req, res) => {
  try {
    // Filter employers by user approval status
    if (
      req.body.user_approval_status === 0 ||
      req.body.user_approval_status === 1
    ) {
      // Fetch logins with user_approval_status
      const logins = await Login.findAll({
        where: {
          user_approval_status: req.body.user_approval_status,
          login_type: "EMP",
        },
        attributes: ["login_id"],
        raw: true,
      });

      // Extract login IDs
      const loginIds = logins.map((login) => login.login_id);

      // Add login IDs to search criteria
      req.body.login_id = loginIds;
    }

    const employers = await aggregateData({
      baseModel: Employer,
      includeModels: [
        {
          model: Login,
          as: "Login",
          attributes: [
            "login_name",
            "login_email",
            "login_mobile",
            "user_approval_status",
          ],
        },
      ],
      body: req.body,
      standardFields: ["createdAt", "cmp_code", "login_id"],
      searchFields: ["cmp_name", "cmp_code"],
      allowedSortFields: ["createdAt"],
    });
    res.status(200).json(employers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employers", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/job-posts:
 *   post:
 *     summary: Retrieve a list of job posts with dynamic filters, sorting, searching, and pagination
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for candidate name or code
 *                 example: John Doe
 *               cmp_id:
 *                 type: integer
 *                 description: Employer ID to filter job posts
 *                 example: 123
 *     responses:
 *       200:
 *         description: List of job posts with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching job posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching job posts."
 */
exports.getJobPosts = async (req, res) => {
  try {
    // Fetch job posts with associated Employer and JobCate models in one query
    const jobPosts = await aggregateData({
      baseModel: JobPost,
      includeModels: [
        {
          model: Employer,
          as: "employer",
          attributes: [
            "cmp_name",
            "cmp_email",
            "cmp_mobn",
            "emp_loca",
            "emp_addr",
          ],
        },
        {
          model: JobCate,
          as: "job_category",
          attributes: ["cate_desc"],
        },
      ],
      body: req.body,
      standardFields: ["createdAt", "cmp_id"],
      searchFields: ["job_title", "job_desc"],
      allowedSortFields: ["createdAt"],
    });

    // Fetch all profile access data at once and group by job_id
    const profileAccessData = await ProfileAccess.findAll({
      attributes: ["candidateId", "accessibleJobPostsByCandidate"],
    });

    // Create a Map for faster lookup of profile access by job_id
    const jobAccessMap = new Map();

    profileAccessData.forEach((access) => {
      access.accessibleJobPostsByCandidate.forEach((jobId) => {
        if (!jobAccessMap.has(jobId)) {
          jobAccessMap.set(jobId, []);
        }
        jobAccessMap.get(jobId).push(access.candidateId);
      });
    });

    // Map the profile access data to job posts directly
    const jobPostsJson = jobPosts.records.map((job) => {
      const job_id = job.job_id;
      return {
        ...job.toJSON(),
        profileAccess: jobAccessMap.get(job_id) || [],
      };
    });

    res.status(200).json({
      ...jobPosts,
      records: jobPostsJson,
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    res
      .status(500)
      .json({ message: "Error fetching job posts", error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/admin/users/{id}/approval-status:
 *   put:
 *     summary: Update the approval status of a user
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_approval_status:
 *                 type: integer
 *                 description: New approval status of the user
 *                 example: 1
 *                 enum: [0, 1]
 *     responses:
 *       200:
 *         description: User approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User approval status updated"
 *       500:
 *         description: Error updating user approval status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to update approval status."
 */
exports.updateUserApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_approval_status } = req.body;
    const login = await Login.findByPk(id);
    if (!login) {
      return res.status(404).json({ message: "User not found" });
    }
    login.user_approval_status = user_approval_status;
    await login.save();
    res.status(200).json({ message: "User approval status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user approval status", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/candidates/{id}/open-to-job:
 *   put:
 *     summary: Update the open to job status of a candidate
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               open_to_job:
 *                 type: boolean
 *                 description: New open to job status of the candidate
 *                 enum: [0, 1]
 *             example:
 *               open_to_job: 1
 *     responses:
 *       200:
 *         description: Candidate open to job status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Candidate open to job status updated"
 *       500:
 *         description: Error updating candidate open to job status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error updating candidate open to job status"
 */
exports.updateCandidateOpenToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { open_to_job } = req.body;
    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    candidate.open_to_job = open_to_job;
    await candidate.save();
    res.status(200).json({ message: "Candidate open to job status updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating candidate open to job status", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/employers/{id}:
 *   get:
 *     summary: Get an employer by ID
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employer ID
 *     responses:
 *       200:
 *         description: Employer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employer:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Employer ID
 *                     cmp_name:
 *                       type: string
 *                       description: Company name
 *                     cmp_code:
 *                       type: string
 *                       description: Company code
 *                     cmp_email:
 *                       type: string
 *                       description: Company email
 *                     cmp_mobile:
 *                       type: string
 *                       description: Company mobile
 *                     createdAt:
 *                       type: string
 *                       description: Date of creation
 *                       format: date-time
 *                     totalJobPosts:
 *                       type: integer
 *                       description: Total number of job posts
 *                     totalProfileAccess:
 *                       type: integer
 *                       description: Total number of profile accesses
 *                     totalAccessRequests:
 *                       type: integer
 *                       description: Total number of access requests
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Error fetching employer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Error fetching employer details."
 */
exports.getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Use Promise.all for concurrent database queries
    const [employer, totalJobPosts, totalProfileAccess, totalAccessRequests] =
      await Promise.all([
        Employer.findByPk(id),
        JobPost.count({ where: { cmp_id: id } }),
        ProfileAccess.count({ where: { employerId: id } }),
        AccessRequest.count({ where: { employerId: id } }),
      ]);

    // Early return if employer not found
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Send response with all data
    res.status(200).json({
      employer,
      totalJobPosts,
      totalProfileAccess,
      totalAccessRequests,
    });
  } catch (error) {
    // Use error logging middleware in production
    console.error("Error in getEmployerById:", error);

    // Send a generic error message to prevent info leakage
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/v1/admin/get-not-accessible-candidates:
 *   post:
 *     summary: Retrieve a list of non accessible candidates with dynamic filters, sorting, searching, and pagination
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by
 *                 example: cmp_name
 *                 enum: [cmp_name, emp_loca]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for company name or location(city)
 *                 example: webwise solution
 *               employerId:
 *                 type: integer
 *                 description: Employer ID to filter candidates by profile access
 *     responses:
 *       200:
 *         description: List of employers with pagination and filter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number
 *                     prevPage:
 *                       type: integer
 *                       description: Current page number
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Has next page
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Has previous page
 *       500:
 *         description: Error fetching employers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
exports.getCandidatesNotAccessibleToEmployer = async (req, res) => {
  try {
    const { body } = req;

    // Fetch all candidate IDs from access requests created by the employer
    const accessRequests = await AccessRequest.findAll({
      where: { employerId: body.employerId },
      attributes: ["candidateId"],
      raw: true,
    });

    const accessRequestIds = new Set(accessRequests.map((a) => a.candidateId));

    // Fetch candidates not in the list of access requests
    const candidates = await Candidate.findAll({
      where: {
        can_code: {
          [Op.notIn]: [...accessRequestIds],
        },
      },
      attributes: ["can_code"],
      raw: true,
    });

    const candidateCodes = candidates.map((candidate) => candidate.can_code);

    // Aggregate candidate data
    const aggregatedData = await aggregateData({
      baseModel: Candidate,
      includeModels: [], // No associated models to include
      body: {
        ...body,
        can_code: candidateCodes,
      },
      standardFields: ["can_name", "can_email", "can_code"],
      rangeFields: [], // No range filters required
      searchFields: ["can_name", "can_email"],
      allowedSortFields: ["createdAt"],
    });

    return res.status(200).json(aggregatedData);
  } catch (error) {
    console.error(
      "Error fetching candidates not accessible to employer:",
      error
    );
    return res
      .status(500)
      .json({ message: "Error fetching candidates", error });
  }
};

/**
 * @swagger
 * /api/v1/admin/get-job-posts-with-no-access-granted-to-candidates:
 *   post:
 *     summary: Retrieve a list of job posts with no access granted to the candidates.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: Page number for pagination.
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 description: Number of records per page.
 *                 example: 10
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by.
 *                 example: createdAt
 *                 enum: [createdAt]
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC).
 *                 example: ASC
 *                 enum: [ASC, DESC]
 *               search:
 *                 type: string
 *                 description: Search term for job title or description.
 *                 example: web developer
 *               employerId:
 *                 type: integer
 *                 description: Employer ID to filter job posts by access.
 *                 example: 123
 *     responses:
 *       200:
 *         description: List of job posts with pagination and filter details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of items.
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages.
 *                     currentPage:
 *                       type: integer
 *                       description: Current page number.
 *                     nextPage:
 *                       type: integer
 *                       description: Next page number.
 *                     prevPage:
 *                       type: integer
 *                       description: Previous page number.
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Indicates if there is a next page.
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Indicates if there is a previous page.
 *       500:
 *         description: Error fetching job posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
exports.getJobPostsWithNoAccess = async (req, res) => {
  try {
    const { body } = req;

    // Fetch all accessible job post IDs into a flat array
    const profileAccess = await ProfileAccess.findAll({
      attributes: ["accessibleJobPostsByCandidate"],
      raw: true,
    });

    const jobPostIds = new Set(
      profileAccess.flatMap((access) => access.accessibleJobPostsByCandidate)
    );

    // Fetch job posts not in the list of accessible job posts
    const jobPosts = await JobPost.findAll({
      where: {
        job_id: {
          [Op.notIn]: [...jobPostIds],
        },
      },
      attributes: ["job_id"],
      raw: true,
    });

    const jobPostCodes = jobPosts.map((job) => job.job_id);

    // Aggregate job post data with optimized fields
    const aggregatedData = await aggregateData({
      baseModel: JobPost,
      includeModels: [
        {
          model: Employer,
          as: "employer",
          attributes: ["cmp_name", "cmp_email", "cmp_mobn", "emp_loca"],
        },
        {
          model: JobCate,
          as: "job_category",
          attributes: ["cate_desc"],
        },
      ], // No associations to include
      body: {
        ...body,
        job_id: jobPostCodes,
      },
      standardFields: ["job_title", "job_desc", "job_id"],
      rangeFields: [], // No range fields needed
      searchFields: ["job_title", "job_desc"],
      allowedSortFields: ["createdAt"],
    });

    // map the profile access data to job posts directly
    const jobPostsJson = aggregatedData.records.map((job) => {
      return {
        ...job.toJSON(),
        profileAccess: [],
      };
    });

    return res.status(200).json({
      ...aggregatedData,
      records: jobPostsJson,
    });
  } catch (error) {
    console.error("Error fetching job posts with no access:", error);
    return res.status(500).json({
      message: "Error fetching job posts",
      error: error.message || "Unexpected error occurred",
    });
  }
};

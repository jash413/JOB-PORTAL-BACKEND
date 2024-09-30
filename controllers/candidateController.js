// controllers/candidateController.js

const Candidate = require("../models/candidate");
const JobCate = require("../models/jobCate");
const JobPost = require("../models/jobPost");
const ProfileAccess = require("../models/profileAccess");
const createFileUploadConfig = require("../utils/fileUpload");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: API for managing candidates.
 */

/**
 * @swagger
 * /api/v1/candidates/get-candidates:
 *   post:
 *     summary: Retrieve a list of candidates with filters, pagination, and sorting
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
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
 *                 example: can_name
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               search:
 *                 type: string
 *                 description: Search term for candidate name or email
 *                 example: John
 *               can_job_cate:
 *                 type: string
 *                 description: Job code for filtering candidates
 *                 example: DEV01
 *               reg_date:
 *                 type: string
 *                 format: date
 *                 description: Registration date range for filtering
 *                 example: "2024-01-01"
 *     responses:
 *       200:
 *         description: A list of candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   can_code:
 *                     type: integer
 *                   can_name:
 *                     type: string
 *                   can_email:
 *                     type: string
 *                   can_mobn:
 *                     type: string
 *                   can_job_cate:
 *                     type: string
 *                   reg_date:
 *                     type: string
 *                     format: date
 *                   can_profile_img:
 *                     type: string
 *                     description: Profile image URL
 *                   can_resume:
 *                     type: string
 *                     description: Resume file URL
 *       500:
 *         description: Error fetching candidates
 */
exports.getAllCandidates = async (req, res) => {
  try {
    // Models to be included in the query
    const includeModels = [
      {
        model: JobCate,
        as: "job_category",
        attributes: ["cate_desc"],
      },
    ];

    // Fields for filtering, searching, and sorting
    const standardFields = ["can_name", "can_job_cate", "can_email"];
    const rangeFields = ["reg_date"];
    const searchFields = ["can_name", "can_email"];
    const allowedSortFields = ["can_name", "can_job_cate", "reg_date"];

    // Aggregation of candidate data with filters, pagination, and sorting
    const aggregatedData = await aggregateData({
      baseModel: Candidate,
      includeModels,
      body: req.body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   get:
 *     summary: Retrieve a single candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The candidate ID
 *     responses:
 *       200:
 *         description: A candidate object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 can_code:
 *                   type: integer
 *                 can_name:
 *                   type: string
 *                 can_email:
 *                   type: string
 *                 can_mobn:
 *                   type: string
 *                 can_job_cate:
 *                   type: string
 *                 reg_date:
 *                   type: string
 *                   format: date
 *                 can_profile_img:
 *                   type: string
 *                   description: Profile image URL
 *                 can_resume:
 *                   type: string
 *                   description: Resume file URL
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Error fetching candidate
 */
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json(candidate);
  } catch (error) {
    res.status(500).json({ error: "Error fetching candidate" });
  }
};

/**
 * @swagger
 * /api/v1/candidates:
 *   post:
 *     summary: Create a new candidate with profile image and resume upload
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               can_name:
 *                 type: string
 *               can_email:
 *                 type: string
 *               can_mobn:
 *                 type: string
 *               can_job_cate:
 *                 type: integer
 *               reg_date:
 *                 type: string
 *                 format: date
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file upload
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file upload
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 can_code:
 *                   type: integer
 *                 can_name:
 *                   type: string
 *                 can_email:
 *                   type: string
 *                 can_mobn:
 *                   type: string
 *                 can_job_cate:
 *                   type: integer
 *                 reg_date:
 *                   type: string
 *                   format: date
 *                 can_profile_img:
 *                   type: string
 *                   description: Profile image URL
 *                 can_resume:
 *                   type: string
 *                   description: Resume file URL
 *       400:
 *         description: Error creating candidate
 */
exports.createCandidate = async (req, res) => {
  try {
    // Upload configuration
    const { uploadFiles } = await createFileUploadConfig({
      uploadDir: "uploads/candidates",
      fileTypes: { image: /jpeg|jpg|png/, document: /pdf/ },
      maxFileSize: 5 * 1024 * 1024, // 5MB max file size
    });

    // Upload files and get paths
    const uploadedFiles = await uploadFiles(req, res, [
      "profileImage",
      "resume",
    ]);
    const { can_name, can_email, can_mobn, can_job_cate, reg_date } = req.body;

    // Extract uploaded file paths
    const profileImageUrl = uploadedFiles.profileImage || null;
    const resumeUrl = uploadedFiles.resume || null;

    // Create candidate record
    const newCandidate = await Candidate.create({
      login_id: req.user.login_id,
      can_name,
      can_email,
      can_mobn,
      can_job_cate,
      reg_date,
      can_profile_img: profileImageUrl,
      can_resume: resumeUrl,
    });

    res.status(201).json(newCandidate);
  } catch (error) {
    console.error("Error creating candidate:", error);
    res
      .status(400)
      .json({ error: error.message || "Error creating candidate" });
  }
};

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   put:
 *     summary: Update a candidate with profile image and resume upload
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The candidate ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               can_name:
 *                 type: string
 *               can_email:
 *                 type: string
 *               can_mobn:
 *                 type: string
 *               can_job_cate:
 *                 type: string
 *               reg_date:
 *                 type: string
 *                 format: date
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file upload
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: Resume file upload
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *       404:
 *         description: Candidate not found
 *       400:
 *         description: Error updating candidate
 */
exports.updateCandidate = async (req, res) => {
  const { id } = req.params;

  multipleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { can_name, can_email, can_mobn, can_job_cate, reg_date } =
        req.body;
      const profileImageUrl = req.files?.profileImage?.[0]?.path || null;
      const resumeUrl = req.files?.resume?.[0]?.path || null;

      const candidate = await Candidate.findByPk(id);

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Update candidate details
      candidate.can_name = can_name || candidate.can_name;
      candidate.can_email = can_email || candidate.can_email;
      candidate.can_mobn = can_mobn || candidate.can_mobn;
      candidate.can_job_cate = can_job_cate || candidate.can_job_cate;
      candidate.reg_date = reg_date || candidate.reg_date;
      if (profileImageUrl) candidate.can_profile_img = profileImageUrl;
      if (resumeUrl) candidate.can_resume = resumeUrl;

      await candidate.save();

      res.status(200).json({ message: "Candidate updated successfully" });
    } catch (error) {
      res.status(400).json({ error: "Error updating candidate" });
    }
  });
};

/**
 * @swagger
 * /api/v1/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate by ID
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Error deleting candidate
 */
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Candidate.destroy({ where: { can_code: id } });

    if (!deleted) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ error: "Error deleting candidate" });
  }
};

/**
 * @swagger
 * /api/v1/candidates/job-posts:
 *   post:
 *     summary: Retrieve job posts available for a candidate, filtered by access and search criteria
 *     tags: [Candidates]
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
 *                   candidateId:
 *                     type: integer
 *                     description: Filter by candidate ID to see job posts for a specific candidate
 *               search:
 *                 type: string
 *                 description: Search string for partial matches in job titles
 *               sort:
 *                 type: object
 *                 description: Fields to sort by
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: The field to sort by (e.g., createdAt)
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
 *         description: List of job posts accessible to the candidate
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
 *                       jobId:
 *                         type: integer
 *                         description: Job post ID
 *                       job_title:
 *                         type: string
 *                         description: Title of the job
 *                       employer:
 *                         type: object
 *                         properties:
 *                           employerId:
 *                             type: integer
 *                             description: Employer ID
 *                           cmp_name:
 *                             type: string
 *                             description: Name of the employer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date when the job post was created
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of job posts
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
 *         description: Error fetching job posts
 */
exports.getJobPosts = async (req, res) => {
  try {
    const standardFields = ["candidateId"]; // Only requests with candidateId
    const includeModels = [{
      model: JobPost,
      as: "JobPost",
      attributes: ["job_title"]
    }]; // Include job posts from employers
    const searchFields = ["JobPost.job_title"]; // Allow searching by job title
    const allowedSortFields = ["createdAt"]; // Sort by creation date of the job post

    const aggregatedData = await aggregateData({
      baseModel: ProfileAccess,
      includeModels,
      body: req.body, // Including filters, pagination, sorting from the request body
      standardFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching job posts", error });
  }
};

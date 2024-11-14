// controllers/jobApplicationController.js
const JobApplication = require("../models/jobApplication");
const JobPost = require("../models/jobPost");
const Candidate = require("../models/candidate");
const JobCate = require("../models/jobCate");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * /api/v1/job-applications/apply:
 *   post:
 *     summary: Apply for a job.
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - candidateId
 *               - job_id
 *             properties:
 *               candidateId:
 *                 type: integer
 *                 description: The ID of the candidate applying.
 *               job_id:
 *                 type: integer
 *                 description: The ID of the job post to apply for.
 *     responses:
 *       201:
 *         description: Job application submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job application submitted successfully.
 *       400:
 *         description: Candidate has already applied for the job.
 *       500:
 *         description: Failed to apply for the job.
 */
exports.applyForJob = async (req, res) => {
  const { candidateId, job_id } = req.body;

  try {
    // Check if the candidate has already applied for this job
    const existingApplication = await JobApplication.findOne({
      where: { candidateId, job_id },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });
    }

    // Create a new job application
    const jobApplication = await JobApplication.create({
      candidateId,
      job_id,
    });
    res.status(201).json({
      message: "Job application submitted successfully.",
      jobApplication,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Failed to apply for the job.", error });
  }
};

/**
 * @swagger
 * /api/v1/job-applications/candidate/{candidateId}:
 *   get:
 *     summary: Get all job applications by a candidate.
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the candidate.
 *     responses:
 *       200:
 *         description: A list of job applications by the candidate.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch applications.
 */
exports.getCandidateApplications = async (req, res) => {
  try {
    const { body } = req;

    const includeModels = [
      {
        model: JobPost,
        as: "jobPost",
        attributes: ["job_title", "job_location", "job_salary"],
      },
    ];

    // Standard Fields
    const standardFields = ["jobPostId"];

    // Search Fields
    const searchFields = [];

    // Range Fields
    const rangeFields = ["createdAt"];

    // Allowed Sort Fields
    const allowedSortFields = ["createdAt"];

    const aggregatedData = await aggregateData({
      baseModel: JobApplication,
      includeModels,
      body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ message: "Failed to fetch applications.", error });
  }
};

/**
 * @swagger
 * /api/v1/job-applications/for-each-job-post:
 *  post:
 *     summary: Get all job applications for a job post (for employers).
 *     tags: [Job Applications]
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
 *                 example: createdAt
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               job_id:
 *                 type: string
 *                 description: Job id for filtering candidates
 *                 example: 1
 *               candidateId:
 *                type: string
 *                description: Candidate id for filtering candidates
 *                example: 1
 *     responses:
 *       200:
 *         description: A list of job applications for the specified job post.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch applications.
 */
exports.getJobApplications = async (req, res) => {
  const { body } = req;

  try {
    const aggregatedData = await aggregateData({
      baseModel: JobApplication,
      includeModels: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["can_name", "can_code", "can_profile_img"],
          include: [
            {
              model: JobCate,
              as: "job_category",
              attributes: ["cate_desc"],
            },
          ],
        },
      ],
      body,
      standardFields: ["candidateId", "job_id"],
      rangeFields: ["createdAt"],
      searchFields: [],
      allowedSortFields: ["createdAt"],
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ message: "Failed to fetch applications.", error });
  }
};

/**
 * @swagger
 * /api/v1/job-applications/for-each-employer:
 *  post:
 *     summary: Get all job applications for a job post (for employers).
 *     tags: [Job Applications]
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
 *                 example: createdAt
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               cmp_id:
 *                 type: string
 *                 description: Job id for filtering candidates
 *                 example: 1
 *               candidateId:
 *                type: string
 *                description: Candidate id for filtering candidates
 *                example: 1
 *     responses:
 *       200:
 *         description: A list of job applications for the specified job post.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Failed to fetch applications.
 */
exports.getEmployerApplications = async (req, res) => {
  const { body } = req;

  try {
    // Fetch job IDs for the given company ID with only the necessary field
    const jobIds = await JobPost.findAll({
      where: { cmp_id: body.cmp_id },
      attributes: ["job_id"], // Only fetch job_id to reduce data load
      raw: true, // Improves speed by returning plain objects
    }).then((jobPosts) => jobPosts.map((job) => job.job_id));

    // Proceed only if job IDs exist to avoid unnecessary aggregation
    if (jobIds.length === 0) {
      return res
        .status(200)
        .json({ message: "No job applications found.", data: [] });
    }

    // Call aggregateData with the correctly structured body
    const aggregatedData = await aggregateData({
      baseModel: JobApplication,
      includeModels: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["can_name", "can_code", "can_profile_img"],
          include: [
            {
              model: JobCate,
              as: "job_category",
              attributes: ["cate_desc"],
            },
          ],
        },
      ],
      body: {
        ...body,
        job_id: jobIds, // Pass job IDs
      },
      standardFields: ["job_id"],
      rangeFields: ["createdAt"],
      searchFields: [], // Specify search fields if necessary
      allowedSortFields: ["createdAt"],
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch applications.", error: error.message });
  }
};

/**
 * @swagger
 * /api/v1/job-applications/application/{applicationId}/status:
 *   put:
 *     summary: Update the status of a job application (for employers to accept/reject).
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the job application.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected]
 *                 description: The new status of the job application.
 *     responses:
 *       200:
 *         description: Job application status updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Job application status updated.
 *       400:
 *         description: Invalid status value.
 *       404:
 *         description: Job application not found.
 *       500:
 *         description: Failed to update application status.
 */
exports.updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // accepted or rejected

  try {
    const application = await JobApplication.findByPk(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Job application not found." });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    application.status = status;
    await application.save();

    res
      .status(200)
      .json({ message: "Job application status updated.", application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res
      .status(500)
      .json({ message: "Failed to update application status.", error });
  }
};

// controllers/jobApplicationController.js
const JobApplication = require("../models/jobApplication");
const JobPost = require("../models/jobPost");
const Candidate = require("../models/candidate");
const JobCate = require("../models/jobCate");
const CandidateEducation = require("../models/candidateEdu");
const CandidateExperience = require("../models/candidateExpDetails");
const Employer = require("../models/employer");
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
 *               - job_id
 *             properties:
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
  const { job_id } = req.body;

  try {
    // Find the candidate by the login ID from the request
    const candidate = await Candidate.findOne({
      where: { login_id: req.user.login_id },
      attributes: ["can_code"],
      raw: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found." });
    }

    // Check if the candidate has already applied for this job
    const existingApplication = await JobApplication.findOne({
      where: { candidateId: candidate.can_code, job_id },
    });

    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });
    }

    // Create a new job application
    const jobApplication = await JobApplication.create({
      candidateId: candidate.can_code,
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
 * /api/v1/job-applications/candidate-applications:
 *   post:
 *     summary: Get all job applications by a candidate.
 *     tags:
 *       - Job Applications
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
 *                 example: appliedAt
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               status:
 *                 type: string
 *                 description: Job application status (accepted, rejected, or pending)
 *                 example: pending
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

    const candidate = await Candidate.findOne({
      where: { login_id: req.user.login_id },
      attributes: ["can_code"],
      raw: true,
    });

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    const includeModels = [
      {
        model: JobPost,
        as: "job_post",
        attributes: ["job_title", "job_location", "salary", "job_description"],
        include: [
          {
            model: Employer,
            as: "employer",
            attributes: ["cmp_name"],
          },
          {
            model: JobCate,
            as: "job_category",
            attributes: ["cate_desc"],
          },
        ],
      },
    ];

    // Standard Fields
    const standardFields = ["job_id", "candidateId", "status"];

    // Search Fields
    const searchFields = [];

    // Range Fields
    const rangeFields = ["appliedAt"];

    // Allowed Sort Fields
    const allowedSortFields = ["appliedAt"];

    const aggregatedData = await aggregateData({
      baseModel: JobApplication,
      includeModels,
      body: {
        ...body,
        candidateId: candidate.can_code,
      },
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
 *               status:
 *                type: string
 *                description: Job application status (accepted, rejected or pending)
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
          attributes: [
            "can_name",
            "can_code",
            "can_email",
            "can_mobn",
            "can_resume",
          ],
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
      standardFields: ["candidateId", "job_id", "status"],
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
 *               candidateId:
 *                 type: string
 *                 description: Candidate id for filtering candidates
 *                 example: 1
 *               job_cate:
 *                 type: string
 *                 description: Job category code for filtering job posts by category
 *                 example: 1
 *               job_id:
 *                 type: string
 *                 description: Job id for filtering job posts
 *                 example: 1
 *               status:
 *                 type: string
 *                 description: Job application status (accepted, rejected or pending)
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
    // Fetch employer and validate existence
    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
      attributes: ["cmp_code"],
      raw: true,
    });

    if (!employer) {
      return res.status(404).json({ message: "Employer not found." });
    }

    // Build filters with a concise structure
    const filters = {
      cmp_id: employer.cmp_code,
      ...(body.job_cate && { job_cate: body.job_cate }),
    };

    // Retrieve job IDs using a more efficient query
    const jobIds = await JobPost.findAll({
      where: filters,
      attributes: ["job_id"],
      raw: true,
    }).then((jobs) => jobs.map((job) => job.job_id));

    if (jobIds.length === 0) {
      return res
        .status(200)
        .json({ message: "No job applications found.", data: [] });
    }

    // Efficient aggregation with included models
    const aggregatedData = await aggregateData({
      baseModel: JobApplication,
      includeModels: [
        {
          model: Candidate,
          as: "candidate",
          attributes: [
            "can_name",
            "can_code",
            "can_profile_img",
            "can_about",
            "can_skill",
            "can_email",
            "can_mobn",
            "can_resume",
          ],
          include: [
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
        },
        {
          model: JobPost,
          as: "job_post",
          attributes: ["job_title", "job_location"],
        },
      ],
      body: {
        ...body,
        job_id: body.job_id || jobIds,
      },
      standardFields: ["candidateId", "job_id", "status"],
      rangeFields: ["createdAt"],
      allowedSortFields: ["createdAt"],
    });

    // Return the result in a concise response
    return res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return res.status(500).json({
      message: "Failed to fetch applications.",
      error: error.message,
    });
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

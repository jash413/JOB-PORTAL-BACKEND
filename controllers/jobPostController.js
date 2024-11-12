const JobPost = require("../models/jobPost");
const Employer = require("../models/employer");
const JobCate = require("../models/jobCate");
const JobApplication = require("../models/jobApplication");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * tags:
 *   name: Job Posts
 *   description: API for managing job posts.
 */

/**
 * @swagger
 * /api/v1/job-posts:
 *   post:
 *     summary: Create a new job post
 *     tags: [Job Posts]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_title
 *               - job_description
 *               - job_cate
 *               - job_location
 *               - company_id
 *             properties:
 *               job_title:
 *                 type: string
 *               job_description:
 *                 type: string
 *               job_cate:
 *                 type: string
 *               job_location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *               required_skills:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job post created successfully
 *       500:
 *         description: Error creating job post
 */
// Create a new job post
exports.createJobPost = async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      job_cate,
      job_location,
      salary_range,
      required_skills,
    } = req.body;

    const cmp_details = await Employer.findOne({
      where: { login_id: req.user.login_id },
    });

    if (!cmp_details) {
      return res.status(404).json({ error: "Company Details not found" });
    }

    const newJobPost = await JobPost.create({
      job_title,
      job_description,
      job_cate,
      job_location,
      salary_range,
      required_skills,
      cmp_id: cmp_details.cmp_code,
    });

    res.status(201).json(newJobPost);
  } catch (error) {
    console.log("Error creating job post: ", error);
    res.status(500).json({ error: "Error creating job post" });
  }
};

/**
 * @swagger
 * /api/v1/job-posts/get-job-posts:
 *   post:
 *     summary: Retrieve a list of job posts with filters, sorting, searching, and pagination
 *     tags: [Job Posts]
 *     security:
 *      - bearerAuth: []
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
 *                 description: Field to sort by (e.g., job_title, job_location)
 *                 example: job_title
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               search:
 *                 type: string
 *                 description: Search term for job title or job description
 *                 example: "developer"
 *               job_location:
 *                 type: string
 *                 description: Location to filter job posts by
 *                 example: "New York"
 *               job_cate:
 *                 type: integer
 *                 description: Filter by job cate (e.g., Accountant (Senior))
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of job posts
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
 *                       job_id:
 *                         type: integer
 *                       job_title:
 *                         type: string
 *                       job_description:
 *                         type: string
 *                       job_cate:
 *                         type: integer
 *                       job_location:
 *                         type: string
 *                       salary_range:
 *                         type: string
 *                       required_skills:
 *                         type: string
 *                       cmp_id:
 *                         type: integer
 *                       posted_at:
 *                         type: string
 *                         format: date-time
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
 *         description: Error fetching job posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
// Get all job posts
exports.getAllJobPosts = async (req, res) => {
  try {
    const { body } = req;

    // Models to include in the aggregation
    const includeModels = [
      {
        model: Employer,
        as: "employer",
        attributes: ["cmp_name", "cmp_email", "cmp_mobn"],
      },
      {
        model: JobCate,
        as: "job_category",
        attributes: ["cate_desc"],
      }
    ];

    // Fields that support equality filtering
    const standardFields = ["job_title", "job_location", "job_cate"];

    // Fields that support range filtering (if applicable)
    const rangeFields = [];

    // Fields that can be searched
    const searchFields = ["job_title", "job_description"];

    // Fields allowed for sorting
    const allowedSortFields = ["job_title", "job_location", "job_cate"];

    // Fetch aggregated data using the utility function
    const aggregatedData = await aggregateData({
      baseModel: JobPost,
      includeModels,
      body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.error("Error fetching job posts: ", error);
    res.status(500).json({ error: "Error fetching job posts" });
  }
};

/**
 * @swagger
 * /api/v1/job-posts/{id}:
 *   get:
 *     summary: Retrieve a specific job post by ID
 *     tags: [Job Posts]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job post ID
 *     responses:
 *       200:
 *         description: A specific job post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 job_id:
 *                   type: integer
 *                 job_title:
 *                   type: string
 *                 job_description:
 *                   type: string
 *                 job_cate:
 *                   type: string
 *                 job_location:
 *                   type: string
 *                 salary_range:
 *                   type: string
 *                 required_skills:
 *                   type: string
 *                 company_id:
 *                   type: integer
 *                 posted_at:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Error fetching job post
 */
// Get a specific job post by ID
exports.getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPost = await JobPost.findByPk(id, {
      include: [
        {
          model: Employer,
          as: "employer",
          attributes: ["cmp_name", "cmp_email", "cmp_mobn"],
        },
      ],
    });

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    res.status(200).json(jobPost);
  } catch (error) {
    res.status(500).json({ error: "Error fetching job post" });
  }
};

/**
 * @swagger
 * /api/v1/job-posts/{id}:
 *   put:
 *     summary: Update an existing job post
 *     tags: [Job Posts]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_title:
 *                 type: string
 *               job_description:
 *                 type: string
 *               job_cate:
 *                 type: string
 *               job_location:
 *                 type: string
 *               salary_range:
 *                 type: string
 *               required_skills:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job post updated successfully
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Error updating job post
 */
// Update a job post
exports.updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      job_title,
      job_description,
      job_cate,
      job_location,
      salary_range,
      required_skills,
    } = req.body;

    const jobPost = await JobPost.findByPk(id);
    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    // Update job post fields
    jobPost.job_title = job_title || jobPost.job_title;
    jobPost.job_description = job_description || jobPost.job_description;
    jobPost.job_cate = job_cate || jobPost.job_cate;
    jobPost.job_location = job_location || jobPost.job_location;
    jobPost.salary_range = salary_range || jobPost.salary_range;
    jobPost.required_skills = required_skills || jobPost.required_skills;

    await jobPost.save();
    res.status(200).json({ message: "Job post updated successfully", jobPost });
  } catch (error) {
    res.status(500).json({ error: "Error updating job post" });
  }
};

/**
 * @swagger
 * /api/v1/job-posts/{id}:
 *   delete:
 *     summary: Delete a job post
 *     tags: [Job Posts]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job post ID
 *     responses:
 *       200:
 *         description: Job post deleted successfully
 *       404:
 *         description: Job post not found
 *       500:
 *         description: Error deleting job post
 */
// Delete a job post
exports.deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await JobPost.destroy({ where: { job_id: id } });

    if (!deleted) {
      return res.status(404).json({ error: "Job post not found" });
    }

    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job post" });
  }
};

/**
 * @swagger
 * /api/v1/job-posts/get-job-posts-accessible-to-candidate:
 *   post:
 *     summary: Retrieve job posts available for a candidate, filtered by access and search criteria
 *     tags: [Job Posts]
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
// Get job posts accessible to a candidate
exports.getJobPosts = async (req, res) => {
  try {
    const jobPostsData = await aggregateData({
      baseModel: JobPost,
      includeModels: [
        {
          model: Employer,
          as: "employer",
          attributes: ["cmp_name"],
        },
      ],
      body: {
        employerId: ProfileAccess.findAll({
          where: { candidateId: req.body.candidateId },
          attributes: ["employerId"],
        }),
        job_id: ProfileAccess.findAll({
          where: { candidateId: req.body.candidateId },
          attributes: ["accessibleJobPostsByCandidate"],
        }),
      },
      standardFields: [],
      searchFields: ["job_title"], // Allow searching by job title
      allowedSortFields: ["createdAt"], // Sort by creation date of the job post
    });
    res.status(200).json(jobPostsData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching job posts", error });
  }
};

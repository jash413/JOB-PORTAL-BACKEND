const JobCate = require("../models/jobCate");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * tags:
 *   name: Job Categories
 *   description: API for managing job categories.
 */

/**
 * @swagger
 * /api/v1/job-categories/get-job-categories:
 *   post:
 *     summary: Retrieve a paginated list of job categories with filtering, searching, and sorting options
 *     tags: [Job Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 example: 1
 *                 description: The page number to retrieve.
 *               limit:
 *                 type: integer
 *                 example: 2
 *                 description: The number of results per page.
 *               sortBy:
 *                 type: string
 *                 example: cate_code
 *                 enum: [cate_code, cate_desc]
 *                 description: The field by which to sort results.
 *               sortOrder:
 *                 type: string
 *                 enum: [ASC, DESC]
 *                 example: DESC
 *                 description: The sort order, either 'ASC' for ascending or 'DESC' for descending.
 *               search:
 *                 type: string
 *                 example: "E"
 *                 description: Search job categories by partial match in the description.
 *               cate_desc:
 *                 type: string
 *                 example: "Accountant (Senior)"
 *                 description: Filter job categories by exact match on category description.
 *     responses:
 *       200:
 *         description: Successfully retrieved paginated job categories with filters applied.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 records:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cate_code:
 *                         type: integer
 *                       cate_desc:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     nextPage:
 *                       type: integer
 *                       nullable: true
 *                     prevPage:
 *                       type: integer
 *                       nullable: true
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *       500:
 *         description: Error fetching job categories
 */
// Get all job categories
exports.getAllJobCategories = async (req, res) => {
  try {
    const { body } = req;

    // Define standard fields for filtering
    const standardFields = ["cate_desc"];

    // Define range fields for filtering (e.g., date ranges)
    const rangeFields = [];

    // Define fields that can be searched
    const searchFields = ["cate_desc"];

    // Define allowed sort fields
    const allowedSortFields = ["cate_desc", "cate_code"];

    const aggregatedData = await aggregateData({
      baseModel: JobCate,
      body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });
    res.status(200).json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching job categories" });
  }
};

/**
 * @swagger
 * /api/v1/job-categories/{id}:
 *   get:
 *     summary: Get a single job category by ID
 *     tags: [Job Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the job category
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved job category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cate_code:
 *                   type: integer
 *                 cate_desc:
 *                   type: string
 *       404:
 *         description: Job category not found
 *       500:
 *         description: Error fetching job category
 */
// Get a single job category by cate_code
exports.getJobCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCate.findByPk(id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: "Job category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching job category" });
  }
};

/**
 * @swagger
 * /api/v1/job-categories:
 *   post:
 *     summary: Create a new job category
 *     tags: [Job Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cate_desc:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created a new job category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cate_code:
 *                   type: integer
 *                 cate_desc:
 *                   type: string
 *       500:
 *         description: Error creating job category
 */
// Create a new job category
exports.createJobCategory = async (req, res) => {
  try {
    const { cate_desc } = req.body;
    const newCategory = await JobCate.create({ cate_desc });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: "Error creating job category" });
  }
};

/**
 * @swagger
 * /api/v1/job-categories/{id}:
 *   put:
 *     summary: Update a job category by ID
 *     tags: [Job Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the job category to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cate_desc:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated job category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cate_code:
 *                   type: integer
 *                 cate_desc:
 *                   type: string
 *       404:
 *         description: Job category not found
 *       500:
 *         description: Error updating job category
 */
// Update a job category by cate_code
exports.updateJobCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cate_desc } = req.body;
    const category = await JobCate.findByPk(id);

    if (category) {
      category.cate_desc = cate_desc;
      await category.save();
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: "Job category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating job category" });
  }
};

/**
 * @swagger
 * /api/v1/job-categories/{id}:
 *   delete:
 *     summary: Delete a job category by ID
 *     tags: [Job Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the job category to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Job category deleted
 *       404:
 *         description: Job category not found
 *       500:
 *         description: Error deleting job category
 */
// Delete a job category by cate_code
exports.deleteJobCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCate.findByPk(id);

    if (category) {
      await category.destroy();
      res.status(200).json({ message: "Job category deleted" });
    } else {
      res.status(404).json({ error: "Job category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting job category" });
  }
};

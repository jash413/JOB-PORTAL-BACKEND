const Employer = require("../models/employer");
const { aggregateData } = require("../utils/aggregator");

/**
 * @swagger
 * tags:
 *   name: Employers
 *   description: API for managing employers.
 */

/**
 * @swagger
 * /api/v1/employers/get-employers:
 *   post:
 *     summary: Retrieve a list of employers with dynamic filters, sorting, searching, and pagination
 *     tags: [Employers]
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
 *                 example: cmp_name
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (ASC or DESC)
 *                 example: ASC
 *               search:
 *                 type: string
 *                 description: Search term for company name or location
 *                 example: webwise solution
 *     responses:
 *       200:
 *         description: List of employers with pagination and filter details
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
 *                       emp_id:
 *                         type: integer
 *                       cmp_name:
 *                         type: string
 *                       cmp_email:
 *                         type: string
 *                       cmp_mobn:
 *                         type: string
 *                       cmp_webs:
 *                         type: string
 *                       emp_loca:
 *                         type: string
 *                       emp_addr:
 *                         type: string
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
exports.getAllEmployers = async (req, res) => {
  try {
    // Models to include in the aggregation
    const includeModels = [];
    const { body } = req;

    // Fields that support equality filtering
    const standardFields = ["cmp_name", "emp_loca"];

    // Fields that support range filtering
    const rangeFields = [];

    // Fields that can be searched
    const searchFields = ["cmp_name", "emp_loca"];

    // Fields allowed for sorting
    const allowedSortFields = ["cmp_name", "emp_loca"];

    const aggregatedData = await aggregateData({
      baseModel: Employer,
      includeModels,
      body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching employers" });
  }
};

/**
 * @swagger
 * /api/v1/employers/{id}:
 *   get:
 *     summary: Retrieve a specific employer by ID
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The employer ID
 *     responses:
 *       200:
 *         description: A single employer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emp_id:
 *                   type: integer
 *                 cmp_name:
 *                   type: string
 *                 cmp_email:
 *                   type: string
 *                 cmp_mobn:
 *                   type: string
 *                 cmp_webs:
 *                   type: string
 *                 emp_loca:
 *                   type: string
 *                 emp_addr:
 *                   type: string
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Error fetching employer
 */
exports.getEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const employer = await Employer.findByPk(id);
    if (employer) {
      res.status(200).json(employer);
    } else {
      res.status(404).json({ error: "Employer not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching employer" });
  }
};

/**
 * @swagger
 * /api/v1/employers:
 *   post:
 *     summary: Create a new employer
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cmp_name:
 *                 type: string
 *               cmp_email:
 *                 type: string
 *               cmp_mobn:
 *                 type: string
 *               cmp_webs:
 *                 type: string
 *               emp_loca:
 *                 type: string
 *               emp_addr:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emp_id:
 *                   type: integer
 *                 cmp_name:
 *                   type: string
 *                 cmp_email:
 *                   type: string
 *                 cmp_mobn:
 *                   type: string
 *                 cmp_webs:
 *                   type: string
 *                 emp_loca:
 *                   type: string
 *                 emp_addr:
 *                   type: string
 *       500:
 *         description: Error creating employer
 */
exports.createEmployer = async (req, res) => {
  try {
    const { cmp_name, cmp_email, cmp_mobn, cmp_webs, emp_loca, emp_addr } =
      req.body;
    const newEmployer = await Employer.create({
      cmp_name,
      cmp_email,
      cmp_mobn,
      cmp_webs,
      emp_loca,
      emp_addr,
    });
    res.status(201).json(newEmployer);
  } catch (error) {
    res.status(500).json({ error: "Error creating employer" });
  }
};

/**
 * @swagger
 * /api/v1/employers/{id}:
 *   put:
 *     summary: Update an existing employer by ID
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The employer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cmp_name:
 *                 type: string
 *               cmp_email:
 *                 type: string
 *               cmp_mobn:
 *                 type: string
 *               cmp_webs:
 *                 type: string
 *               emp_loca:
 *                 type: string
 *               emp_addr:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 emp_id:
 *                   type: integer
 *                 cmp_name:
 *                   type: string
 *                 cmp_email:
 *                   type: string
 *                 cmp_mobn:
 *                   type: string
 *                 cmp_webs:
 *                   type: string
 *                 emp_loca:
 *                   type: string
 *                 emp_addr:
 *                   type: string
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Error updating employer
 */
exports.updateEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const { cmp_name, cmp_email, cmp_mobn, cmp_webs, emp_loca, emp_addr } =
      req.body;
    const employer = await Employer.findByPk(id);

    if (employer) {
      employer.cmp_name = cmp_name;
      employer.cmp_email = cmp_email;
      employer.cmp_mobn = cmp_mobn;
      employer.cmp_webs = cmp_webs;
      employer.emp_loca = emp_loca;
      employer.emp_addr = emp_addr;
      await employer.save();
      res.status(200).json(employer);
    } else {
      res.status(404).json({ error: "Employer not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error updating employer" });
  }
};

/**
 * @swagger
 * /api/v1/employers/{id}:
 *   delete:
 *     summary: Delete an employer by ID
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The employer ID
 *     responses:
 *       200:
 *         description: Employer deleted successfully
 *       404:
 *         description: Employer not found
 *       500:
 *         description: Error deleting employer
 */
exports.deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const employer = await Employer.findByPk(id);

    if (employer) {
      await employer.destroy();
      res.status(200).json({ message: "Employer deleted" });
    } else {
      res.status(404).json({ error: "Employer not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error deleting employer" });
  }
};
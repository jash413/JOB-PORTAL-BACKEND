const Employer = require("../models/employer");
const Candidate = require("../models/candidate");
const AccessRequest = require("../models/accessRequest");
const ProfileAccess = require("../models/profileAccess");
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
      login_id: req.user.login_id,
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

/**
 * @swagger
 * /api/v1/employers/request-access:
 *   post:
 *     summary: Request access to view a candidate's profile for an employer
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
 *               candidateId:
 *                 type: integer
 *                 description: ID of the candidate for whom access is requested
 *     responses:
 *       201:
 *         description: Access request successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 request:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the access request
 *                     employerId:
 *                       type: integer
 *                       description: ID of the employer
 *                     candidateId:
 *                       type: integer
 *                       description: ID of the candidate
 *                     status:
 *                       type: string
 *                       description: Status of the request (e.g., pending, approved, rejected)
 *       400:
 *         description: An access request for this candidate already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Error submitting the access request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: object
 *                   description: Error details
 */
exports.requestAccessToCandidate = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const employerLoginId = req.user.login_id;

    // Get the employer ID
    const employer = await Employer.findOne({
      where: { login_id: employerLoginId },
    }).then((employer) => employer.toJSON());

    // Check if an access request already exists
    const existingRequest = await AccessRequest.findOne({
      where: { employerId: employer.cmp_code, candidateId, status: "pending" },
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Access request already exists" });
    }

    // Create a new access request
    const request = await AccessRequest.create({
      employerId: employer.cmp_code,
      candidateId,
    });
    res.status(201).json({ message: "Access request submitted.", request });
  } catch (error) {
    res.status(500).json({ message: "Error submitting access request", error });
  }
};

/**
 * @swagger
 * /api/v1/employers/approved-candidates:
 *   post:
 *     summary: Retrieve a list of candidates whose profiles have been approved for access by the employer
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
 *               employerId:
 *                 type: integer
 *                 description: ID of the employer
 *               search:
 *                 type: string
 *                 description: Search term for candidate name or email
 *               sort:
 *                 type: object
 *                 description: Sorting options for candidates
 *                 properties:
 *                   field:
 *                     type: string
 *                     description: Field to sort by (e.g., grantedAt)
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
 *         description: A list of approved candidates
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
 *                       candidateId:
 *                         type: integer
 *                         description: ID of the candidate
 *                       can_name:
 *                         type: string
 *                         description: Candidate name
 *                       can_email:
 *                         type: string
 *                         description: Candidate email
 *                       grantedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Date when the access was granted
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       description: Total number of candidates
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
 *         description: Error fetching approved candidates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 error:
 *                   type: object
 *                   description: Error details
 */
exports.getApprovedCandidates = async (req, res) => {
  try {
    const standardFields = ["employerId"]; // Filter by employer ID
    const includeModels = [
      {
        model: Candidate,
        attributes: ["can_name", "can_email"],
        as: "Candidate"
      },
    ]; // Include candidate model
    const searchFields = ["Candidate.can_name", "Candidate.can_email"]; // Allow searching by candidate name and email
    const allowedSortFields = ["grantedAt"]; // Sort by the date the access was granted

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
    console.log(error)
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

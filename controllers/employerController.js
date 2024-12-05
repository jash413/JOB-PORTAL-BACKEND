const Employer = require("../models/employer");
const Candidate = require("../models/candidate");
const AccessRequest = require("../models/accessRequest");
const ProfileAccess = require("../models/profileAccess");
const JobCate = require("../models/jobCate");
const CandidateEducation = require("../models/candidateEdu");
const CandidateExperience = require("../models/candidateExpDetails");
const JobPost = require("../models/jobPost");
const JobApplication = require("../models/jobApplication");
const Login = require("../models/loginMast");
const { Op } = require("sequelize");
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
 *               cmp_name:
 *                 type: string
 *                 description: Company name for exact match
 *                 example: webwise solution
 *               emp_loca:
 *                 type: string
 *                 description: Location of the employer for exact match
 *                 example: Bangalore
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
 *     responses:
 *       200:
 *         description: List of employers with pagination and filter details
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
 *                       login_id:
 *                         type: integer
 *                       cmp_code:
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
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
 *         description: The login ID
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
    const employer = await Employer.findOne({
      where: { login_id: id },
    });
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

    // Check for duplicate email and mobile
    const duplicateEmail = await Login.findOne({
      where: { login_email: cmp_email },
    });
    if (duplicateEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const duplicateMobile = await Login.findOne({
      where: { login_mobile: cmp_mobn },
    });
    if (duplicateMobile) {
      return res.status(400).json({ error: "Mobile number already in use" });
    }

    const newEmployer = await Employer.create({
      login_id: req.user.login_id,
      cmp_name,
      cmp_email,
      cmp_mobn,
      cmp_webs,
      emp_loca,
      emp_addr,
    });

    await Login.update(
      { profile_created: 1 },
      { where: { login_id: req.user.login_id } }
    );
    res.status(201).json(newEmployer);
  } catch (error) {
    res.status(500).json({ error: "Error creating employer" });
  }
};

/**
 * @swagger
 * /api/v1/employers:
 *   put:
 *     summary: Update an existing employer by ID
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
    const { cmp_name, cmp_email, cmp_mobn, cmp_webs, emp_loca, emp_addr } =
      req.body;
    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Check for duplicate email and mobile, ignoring the current employer's ID
    const duplicateEmail = await Login.findOne({
      where: {
        login_email: cmp_email,
        cmp_code: { [Op.ne]: employer.login_id },
      },
    });
    if (duplicateEmail) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const duplicateMobile = await Login.findOne({
      where: {
        login_mobile: cmp_mobn,
        cmp_code: { [Op.ne]: employer.login_id },
      },
    });
    if (duplicateMobile) {
      return res.status(400).json({ error: "Mobile number already in use" });
    }

    // Update Employer record
    Object.assign(employer, {
      cmp_name,
      cmp_email,
      cmp_mobn,
      cmp_webs,
      emp_loca,
      emp_addr,
    });
    await employer.save();

    res.status(200).json(employer);
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
    const { body } = req;

    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const standardFields = ["employerId"]; // Filter by employer ID
    const includeModels = [
      {
        model: Candidate,
        attributes: ["can_name", "can_email"],
        as: "Candidate",
      },
    ]; // Include candidate model
    const searchFields = []; // Allow searching by candidate name and email
    const allowedSortFields = ["grantedAt"]; // Sort by the date the access was granted

    const aggregatedData = await aggregateData({
      baseModel: ProfileAccess,
      includeModels,
      body: {
        ...body,
        employerId: employer.cmp_code,
      }, // Including filters, pagination, sorting from the request body
      standardFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching candidates", error });
  }
};

exports.getEmployersAccessibleToCandidate = async (req, res) => {
  try {
    const includeModels = []; // Include candidate model

    const standardFields = ["cmp_name", "emp_loca"]; // Filter by employer ID

    const rangeFields = []; // Filter by employer ID

    const searchFields = ["cmp_name", "emp_loca"]; // Allow searching by candidate name and email

    const allowedSortFields = ["createdAt"]; // Sort by the date the access was granted

    const aggregatedData = await aggregateData({
      baseModel: Employer,
      includeModels,
      body: {
        emp_code: ProfileAccess.findAll({
          where: { candidateId: req.body.candidateId },
          attributes: ["employerId"],
        }),
      },
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employers", error });
  }
};

/**
 * @swagger
 * /api/v1/employers/get-not-accessible-candidates:
 *   post:
 *     summary: Retrieve a list of non accessible candidates with dynamic filters, sorting, searching, and pagination
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

    // Fetch employer details
    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
      attributes: ["cmp_code"], // Only fetch required field
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const employerId = employer.cmp_code;

    // Fetch all candidate IDs from access requests created by the employer
    const accessRequests = await AccessRequest.findAll({
      where: { employerId },
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
 * /api/v1/employers/get-access-requests:
 *   post:
 *     summary: Retrieve a list of access requests with dynamic filters, sorting, searching, and pagination
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
exports.getAccessRequests = async (req, res) => {
  try {
    const { body } = req;

    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    const accessRequests = await aggregateData({
      baseModel: AccessRequest,
      includeModels: [
        {
          model: Candidate,
          attributes: [
            "can_name",
            "can_email",
            "can_mobn",
            "can_about",
            "can_skill",
          ],
          as: "Candidate",
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
      ],
      body: {
        ...body,
        employerId: employer.cmp_code,
      },
      standardFields: ["employerId", "candidateId", "status"],
      rangeFields: [],
      searchFields: [],
      allowedSortFields: ["requestedAt"],
    });

    res.status(200).json(accessRequests);
  } catch (error) {
    console.error("Error fetching access requests:", error);
    res.status(500).json({ message: "Error fetching access requests", error });
  }
};

/**
 * @swagger
 * /api/v1/employers/dashboard-data:
 *   get:
 *     summary: Get the dashboard data for the employer
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employer dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalJobs:
 *                   type: integer
 *                   description: Total number of job posts created by the employer
 *                 totalApplicants:
 *                   type: integer
 *                   description: Total number of applicants for the employer's job posts
 *                 appliedRate:
 *                   type: number
 *                   description: Rate of applications per job post
 *       500:
 *         description: Error fetching dashboard data
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
exports.getEmployerDashboardData = async (req, res) => {
  try {
    // Fetch employer information
    const employer = await Employer.findOne({
      where: { login_id: req.user.login_id },
      attributes: ["cmp_code"], // Only fetch necessary fields
      raw: true,
    });

    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }

    // Fetch job posts for the employer
    const jobPosts = await JobPost.findAll({
      where: { cmp_id: employer.cmp_code },
      attributes: ["job_id"], // Only fetch necessary fields
    });

    const totalJobs = jobPosts.length;

    if (totalJobs === 0) {
      return res.status(200).json({
        totalJobs: 0,
        totalApplicants: 0,
        appliedRate: 0,
      });
    }

    // Extract job IDs
    const jobPostIds = jobPosts.map((jobPost) => jobPost.job_id);

    // Count applicants for all jobs in a single query
    const totalApplicants = await JobApplication.count({
      where: { job_id: { [Op.in]: jobPostIds } },
    });

    // Calculate applied rate
    const appliedRate = totalJobs > 0 ? totalApplicants / totalJobs : 0;

    res.status(200).json({
      totalJobs,
      totalApplicants,
      appliedRate,
    });
  } catch (error) {
    console.error("Error fetching employer dashboard data:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

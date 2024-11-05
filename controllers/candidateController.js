// controllers/candidateController.js

const Candidate = require("../models/candidate");
const JobCate = require("../models/jobCate");
const Login = require("../models/loginMast");
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

  try {
    // Configure file upload with dynamic parameters
    const fileUploadConfig = createFileUploadConfig({
      uploadDir: "uploads/candidates",
      fileTypes: { image: /jpeg|jpg|png/, document: /pdf/ },
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });
    const { uploadFiles, deleteFile } = fileUploadConfig;

    // Upload files and capture paths
    const uploadedFiles = await uploadFiles(req, res, [
      "profileImage",
      "resume",
    ]);
    const { can_name, can_email, can_mobn, can_job_cate, reg_date } = req.body;
    const profileImageUrl = uploadedFiles.profileImage || null;
    const resumeUrl = uploadedFiles.resume || null;

    // Retrieve candidate by ID
    const candidate = await Candidate.findByPk(id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Delete old files if new ones are uploaded
    if (profileImageUrl && candidate.can_profile_img)
      await deleteFile(candidate.can_profile_img);
    if (resumeUrl && candidate.can_resume)
      await deleteFile(candidate.can_resume);

    // Retrieve associated login record
    const login = await Login.findByPk(candidate.login_id);
    if (!login) {
      return res.status(404).json({ error: "Associated login not found" });
    }

    // Check for duplicate email and mobile, ignoring the current candidate's ID
    const emailInUse = await Candidate.findOne({ where: { can_email } });
    const mobileInUse = await Candidate.findOne({ where: { can_mobn } });
    if (emailInUse && emailInUse.can_code !== parseInt(id, 10)) {
      return res.status(400).json({ error: "Email already in use" });
    }
    if (mobileInUse && mobileInUse.can_code !== parseInt(id, 10)) {
      return res.status(400).json({ error: "Mobile number already in use" });
    }

    // Reset verification status if email or mobile is changed
    if (can_email && can_email !== candidate.can_email)
      login.email_ver_status = 0;
    if (can_mobn && can_mobn !== candidate.can_mobn) login.phone_ver_status = 0;

    // Update login details
    Object.assign(login, {
      login_name: can_name,
      login_email: can_email,
      login_mobile: can_mobn,
    });
    await login.save();

    // Update candidate details
    Object.assign(candidate, {
      can_name: can_name || candidate.can_name,
      can_email: can_email || candidate.can_email,
      can_mobn: can_mobn || candidate.can_mobn,
      can_job_cate: can_job_cate || candidate.can_job_cate,
      reg_date: reg_date || candidate.reg_date,
      can_profile_img: profileImageUrl || candidate.can_profile_img,
      can_resume: resumeUrl || candidate.can_resume,
    });
    await candidate.save();

    res.status(200).json({ message: "Candidate updated successfully" });
  } catch (error) {
    console.error("Error updating candidate:", error); // Log error for debugging
    res.status(500).json({ error: "Error updating candidate" });
  }
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

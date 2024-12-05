// controllers/candidateController.js

const Candidate = require("../models/candidate");
const JobCate = require("../models/jobCate");
const Login = require("../models/loginMast");
const CandidateExpDetails = require("../models/candidateExpDetails");
const CandidateEduDetails = require("../models/candidateEdu");
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
 *         description: The login ID
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
    const candidate = await Candidate.findOne({
      where: { login_id: id },
      include: [
        {
          model: JobCate,
          as: "job_category",
          attributes: ["cate_desc"],
        },
        {
          model: CandidateEduDetails,
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
          model: CandidateExpDetails,
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
    });

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
 *               can_skill:
 *                 type: string
 *               can_about:
 *                 type: string
 *                 description: About candidate
 *               open_to_job:
 *                 type: boolean
 *                 description: New open to job status of the candidate
 *                 enum: [0, 1]
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
    const {
      can_name,
      can_email,
      can_mobn,
      can_job_cate,
      reg_date,
      can_about,
      can_skill,
      open_to_job,
    } = req.body;

    // Extract uploaded file paths
    const profileImageUrl = uploadedFiles.profileImage || null;
    const resumeUrl = uploadedFiles.resume || null;

    // Check for duplicate email and mobile
    const emailInUse = await Login.findOne({
      where: { login_email: can_email },
    });
    const mobileInUse = await Candidate.findOne({
      where: { login_mobile: can_mobn },
    });
    if (emailInUse) {
      return res.status(400).json({ error: "Email already in use" });
    }
    if (mobileInUse) {
      return res.status(400).json({ error: "Mobile number already in use" });
    }

    // Check and create login if not exists
    let login = await Login.findByPk(req.user.login_id);
    if (!login) {
      login = await Login.create({
        login_id: req.user.login_id,
        login_name: can_name,
        login_email: can_email,
        login_mobile: can_mobn,
        profile_created: 1,
      });
    }

    // Create candidate record
    const newCandidate = await Candidate.create({
      login_id: req.user.login_id,
      can_name,
      can_email,
      can_mobn,
      can_job_cate,
      reg_date,
      can_about,
      can_skill,
      can_profile_img: profileImageUrl,
      can_resume: resumeUrl,
      open_to_job,
    });

    // Update login details if needed
    if (login) {
      if (can_email !== login.login_email) login.email_ver_status = 0;
      if (can_mobn !== login.login_mobile) login.phone_ver_status = 0;
      login.login_name = can_name;
      login.login_email = can_email;
      login.login_mobile = can_mobn;
      login.profile_created = 1;
      await login.save();
    }

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
 * /api/v1/candidates:
 *   put:
 *     summary: Update a candidate with profile image and resume upload
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
 *                 type: string
 *               reg_date:
 *                 type: string
 *                 format: date
 *               open_to_job:
 *                 type: boolean
 *                 description: New open to job status of the candidate
 *                 enum: [0, 1]
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
    const {
      can_name,
      can_email,
      can_mobn,
      can_job_cate,
      reg_date,
      open_to_job,
    } = req.body;
    const profileImageUrl = uploadedFiles.profileImage || null;
    const resumeUrl = uploadedFiles.resume || null;

    // Retrieve candidate by ID
    const candidate = await Candidate.findOne({
      where: { login_id: req.user.login_id },
    });
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
    const emailInUse = await Login.findOne({
      where: { login_email: can_email },
    });
    const mobileInUse = await Login.findOne({
      where: { login_mobile: can_mobn },
    });
    if (emailInUse && emailInUse.login_id !== candidate.login_id) {
      return res.status(400).json({ error: "Email already in use" });
    }
    if (mobileInUse && mobileInUse.login_id !== candidate.login_id) {
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
      open_to_job: open_to_job || candidate.open_to_job,
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

/**
 * @swagger
 * /api/v1/candidates/{id}/resume:
 *   get:
 *     summary: Download a candidate's resume by ID
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
 *         description: Candidate resume file
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Error downloading resume
 */
exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    if (!candidate.can_resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Download resume file
    const { downloadFile } = createFileUploadConfig({
      uploadDir: "uploads/candidates",
    });
    await downloadFile(candidate.can_resume, res);
  } catch (error) {
    console.error("Error downloading resume:", error);
    res.status(500).json({ error: "Error downloading resume" });
  }
};

/**
 * @swagger
 * /api/v1/candidates/{id}/profile-image:
 *   get:
 *     summary: Download a candidate's profile image by ID
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
 *         description: Candidate profile image
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Error downloading profile image
 */
exports.downloadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);

    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    if (!candidate.can_profile_img) {
      return res.status(404).json({ error: "Profile image not found" });
    }

    // Download profile image
    const { downloadFile } = createFileUploadConfig({
      uploadDir: "uploads/candidates",
    });
    await downloadFile(candidate.can_profile_img, res);
  } catch (error) {
    console.error("Error downloading profile image:", error);
    res.status(500).json({ error: "Error downloading profile image" });
  }
};

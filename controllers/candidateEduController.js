const CandidateEducation = require("../models/candidateEdu");
const { aggregateData } = require("../utils/aggregator");
const Candidate = require("../models/candidate");

/**
 * @swagger
 * tags:
 *   name: CandidateEducation
 *   description: Candidate Education management
 */

/**
 * @swagger
 * /api/v1/education/get-edu-details:
 *   post:
 *     summary: Get all education records for a candidate
 *     tags: [CandidateEducation]
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
 *               limit:
 *                 type: integer
 *                 description: Number of items per page
 *               sortBy:
 *                 type: string
 *                 description: Field to sort by (e.g. job_endt or job_stdt)
 *               sortOrder:
 *                 type: string
 *                 description: Sort order (asc or desc)
 *               can_code:
 *                 type: integer
 *                 description: Candidate code
 *                 example: 0
 *     responses:
 *       200:
 *         description: List of education records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Education'
 *       404:
 *         description: No education records found for the candidate
 *       500:
 *         description: Internal server error
 */
exports.getEducationByCandidate = async (req, res) => {
  try {
    // Models to be included in the query
    const includeModels = [
      {
        model: Candidate,
        as: "candidate",
        attributes: ["can_mobn", "can_email", "can_name"],
      },
    ];

    // Fields for filtering, searching, and sorting
    const standardFields = ["can_code"];
    const rangeFields = [];
    const searchFields = [];
    const allowedSortFields = ["can_pasy"];

    // Aggregation of candidate data with filters, pagination, and sorting
    const aggregatedData = await aggregateData({
      baseModel: CandidateEducation,
      includeModels,
      body: req.body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/education/{edu_id}:
 *   get:
 *     summary: Get a single education record by ID
 *     tags: [CandidateEducation]
 *     parameters:
 *       - in: path
 *         name: edu_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Education record ID
 *     responses:
 *       200:
 *         description: Education record details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Education'
 *       404:
 *         description: Education record not found
 *       500:
 *         description: Internal server error
 */
exports.getEducationById = async (req, res) => {
  try {
    const { edu_id } = req.params;
    const educationDetail = await CandidateEducation.findByPk(edu_id);

    if (!educationDetail) {
      return res.status(404).json({ message: "Education record not found" });
    }

    res.status(200).json(educationDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/education/:
 *   post:
 *     summary: Create a new education record
 *     tags: [CandidateEducation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               can_edu:
 *                 type: string
 *                 description: Candidate's education level
 *                 example: "Bachelors"
 *               can_scho:
 *                 type: string
 *                 description: Name of the school or institution
 *                 example: "ABC University"
 *               can_pasy:
 *                 type: string
 *                 description: Year of passing
 *                 example: "2022"
 *               can_perc:
 *                 type: number
 *                 description: Percentage or marks scored
 *                 example: 85.5
 *               can_stre:
 *                 type: string
 *                 description: Candidate's stream or major
 *                 example: "Computer Science"
 *               can_cgpa:
 *                 type: number
 *                 description: CGPA (if applicable)
 *                 example: 8.5
 *               can_code:
 *                 type: integer
 *                 description: Candidate's code
 *                 example: 1234
 *     responses:
 *       201:
 *         description: Education record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Education'
 *       500:
 *         description: Internal server error
 */

exports.createEducation = async (req, res) => {
  try {
    const {
      can_edu,
      can_scho,
      can_pasy,
      can_perc,
      can_stre,
      can_cgpa,
      can_code,
    } = req.body;

    const newEducation = await CandidateEducation.create({
      can_edu,
      can_scho,
      can_pasy,
      can_perc,
      can_stre,
      can_cgpa,
      can_code,
    });

    res.status(201).json(newEducation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1//education/{edu_id}:
 *   put:
 *     summary: Update an education record by ID
 *     tags: [CandidateEducation]
 *     parameters:
 *       - in: path
 *         name: edu_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Education record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Education'
 *     responses:
 *       200:
 *         description: Education record updated successfully
 *       404:
 *         description: Education record not found
 *       500:
 *         description: Internal server error
 */
exports.updateEducation = async (req, res) => {
  try {
    const { edu_id } = req.params;
    const { can_edu, can_scho, can_pasy, can_perc, can_stre, can_cgpa } =
      req.body;

    const educationDetail = await CandidateEducation.findByPk(edu_id);

    if (!educationDetail) {
      return res.status(404).json({ message: "Education record not found" });
    }

    educationDetail.can_edu = can_edu || educationDetail.can_edu;
    educationDetail.can_scho = can_scho || educationDetail.can_scho;
    educationDetail.can_pasy = can_pasy || educationDetail.can_pasy;
    educationDetail.can_perc = can_perc || educationDetail.can_perc;
    educationDetail.can_stre = can_stre || educationDetail.can_stre;
    educationDetail.can_cgpa = can_cgpa || educationDetail.can_cgpa;

    await educationDetail.save();

    res.status(200).json({ message: "Education record updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /education/{edu_id}:
 *   delete:
 *     summary: Delete an education record by ID
 *     tags: [CandidateEducation]
 *     parameters:
 *       - in: path
 *         name: edu_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Education record ID
 *     responses:
 *       200:
 *         description: Education record deleted successfully
 *       404:
 *         description: Education record not found
 *       500:
 *         description: Internal server error
 */
exports.deleteEducation = async (req, res) => {
  try {
    const { edu_id } = req.params;

    const deleted = await CandidateEducation.destroy({ where: { edu_id } });

    if (!deleted) {
      return res.status(404).json({ message: "Education record not found" });
    }

    res.status(200).json({ message: "Education record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const CandidateExpDetails = require("../models/candidateExpDetails");
const { aggregateData } = require("../utils/aggregator");
const Candidate = require("../models/candidate");

/**
 * @swagger
 * tags:
 *   name: Candidate Experience
 *   description: API for managing candidate experience details
 */

/**
 * @swagger
 * /api/v1/experience/candidate:
 *   post:
 *     summary: Get all experience details for a candidate with filters, pagination, and sorting
 *     tags: [Candidate Experience]
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
 *     responses:
 *       200:
 *         description: Experience details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CandidateExpDetails'
 *       404:
 *         description: No experience details found for this candidate
 *       500:
 *         description: Internal server error
 */
// Get all experience details for a candidate
exports.getExpDetailsByCandidate = async (req, res) => {
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
    const allowedSortFields = ["job_endt", "job_stdt"];

    // Aggregation of candidate data with filters, pagination, and sorting
    const aggregatedData = await aggregateData({
      baseModel: CandidateExpDetails,
      includeModels,
      body: req.body,
      standardFields,
      rangeFields,
      searchFields,
      allowedSortFields,
    });

    res.status(200).json(aggregatedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /experience/{exp_id}:
 *   get:
 *     summary: Get a single experience detail by ID
 *     tags: [Candidate Experience]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Experience ID
 *     responses:
 *       200:
 *         description: Experience detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateExpDetails'
 *       404:
 *         description: Experience detail not found
 *       500:
 *         description: Internal server error
 */
// Get a single experience detail by ID
exports.getExpDetailById = async (req, res) => {
  try {
    const { exp_id } = req.params;
    const expDetail = await CandidateExpDetails.findByPk(exp_id);

    if (!expDetail) {
      return res.status(404).json({ message: "Experience detail not found" });
    }

    res.status(200).json(expDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /api/v1/experience:
 *   post:
 *     summary: Create a new experience detail
 *     tags: [Candidate Experience]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emp_name:
 *                 type: string
 *               exp_type:
 *                 type: string
 *               exp_desg:
 *                 type: string
 *               cur_ctc:
 *                 type: number
 *               job_stdt:
 *                 type: string
 *                 format: date
 *               job_endt:
 *                 type: string
 *                 format: date
 *               can_code:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Experience detail created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateExpDetails'
 *       500:
 *         description: Internal server error
 */
// Create a new experience detail
exports.createExpDetail = async (req, res) => {
  try {
    const {
      emp_name,
      exp_type,
      exp_desg,
      cur_ctc,
      job_stdt,
      job_endt,
      can_code,
    } = req.body;

    const newExpDetail = await CandidateExpDetails.create({
      emp_name,
      exp_type,
      exp_desg,
      cur_ctc,
      job_stdt,
      job_endt,
      can_code,
    });

    res.status(201).json(newExpDetail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /experience/{exp_id}:
 *   put:
 *     summary: Update an existing experience detail
 *     tags: [Candidate Experience]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Experience ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emp_name:
 *                 type: string
 *               exp_type:
 *                 type: string
 *               exp_desg:
 *                 type: string
 *               cur_ctc:
 *                 type: number
 *               job_stdt:
 *                 type: string
 *                 format: date
 *               job_endt:
 *                 type: string
 *                 format: date
 *               can_code:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Experience detail updated successfully
 *       404:
 *         description: Experience detail not found
 *       500:
 *         description: Internal server error
 */
// Update an existing experience detail
exports.updateExpDetail = async (req, res) => {
  try {
    const { exp_id } = req.params;
    const {
      emp_name,
      exp_type,
      exp_desg,
      cur_ctc,
      job_stdt,
      job_endt,
      can_code,
    } = req.body;

    const expDetail = await CandidateExpDetails.findByPk(exp_id);

    if (!expDetail) {
      return res.status(404).json({ message: "Experience detail not found" });
    }

    expDetail.emp_name = emp_name || expDetail.emp_name;
    expDetail.exp_type = exp_type || expDetail.exp_type;
    expDetail.exp_desg = exp_desg || expDetail.exp_desg;
    expDetail.cur_ctc = cur_ctc || expDetail.cur_ctc;
    expDetail.job_stdt = job_stdt || expDetail.job_stdt;
    expDetail.job_endt = job_endt || expDetail.job_endt;
    expDetail.can_code = can_code || expDetail.can_code;

    await expDetail.save();

    res.status(200).json({ message: "Experience detail updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @swagger
 * /experience/{exp_id}:
 *   delete:
 *     summary: Delete an experience detail
 *     tags: [Candidate Experience]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exp_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Experience ID
 *     responses:
 *       200:
 *         description: Experience detail deleted successfully
 *       404:
 *         description: Experience detail not found
 *       500:
 *         description: Internal server error
 */
// Delete an experience detail
exports.deleteExpDetail = async (req, res) => {
  try {
    const { exp_id } = req.params;

    const deleted = await CandidateExpDetails.destroy({ where: { exp_id } });

    if (!deleted) {
      return res.status(404).json({ message: "Experience detail not found" });
    }

    res.status(200).json({ message: "Experience detail deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
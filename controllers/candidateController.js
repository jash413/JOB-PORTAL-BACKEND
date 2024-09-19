// controllers/candidateController.js
const Candidate = require("../models/candidate");
const { multipleUpload } = require("../utils/fileUpload");

// Get all candidates
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.findAll();
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: "Error fetching candidates" });
  }
};

// Get a candidate by ID
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

// Create a new candidate with multiple file uploads
exports.createCandidate = async (req, res) => {
  multipleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { can_name, can_email, can_mobn, can_jobc, reg_date } = req.body;

      // Extract uploaded file paths (if any)
      const profileImageUrl = req.files?.profileImage
        ? req.files.profileImage[0].path
        : null;
      const resumeUrl = req.files?.resume ? req.files.resume[0].path : null;

      const newCandidate = await Candidate.create({
        can_name,
        can_email,
        can_mobn,
        can_jobc,
        reg_date,
        can_pics: profileImageUrl,
        can_resume: resumeUrl,
      });

      res.status(201).json(newCandidate);
    } catch (error) {
      res.status(400).json({ error: "Error creating candidate" });
    }
  });
};

// Update a candidate with file uploads
exports.updateCandidate = async (req, res) => {
  const { id } = req.params;

  multipleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Get the new details and files from the request
      const { can_name, can_email, can_mobn, can_jobc, reg_date } = req.body;
      const profileImageUrl = req.files?.profileImage
        ? req.files.profileImage[0].path
        : null;
      const resumeUrl = req.files?.resume ? req.files.resume[0].path : null;

      // Find the candidate and update the details
      const candidate = await Candidate.findByPk(id);

      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Update candidate details
      candidate.can_name = can_name || candidate.can_name;
      candidate.can_email = can_email || candidate.can_email;
      candidate.can_mobn = can_mobn || candidate.can_mobn;
      candidate.can_jobc = can_jobc || candidate.can_jobc;
      candidate.reg_date = reg_date || candidate.reg_date;
      if (profileImageUrl) candidate.can_pics = profileImageUrl;
      if (resumeUrl) candidate.can_resume = resumeUrl;

      await candidate.save();

      res.status(200).json({ message: "Candidate updated successfully" });
    } catch (error) {
      res.status(400).json({ error: "Error updating candidate" });
    }
  });
};

// Delete a candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Candidate.destroy({
      where: { can_code: id },
    });
    if (!deleted) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting candidate" });
  }
};

// controllers/employerController.js
const Employer = require("../models/employer");

// Get all employers
exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.findAll();
    res.status(200).json(employers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching employers" });
  }
};

// Get a specific employer by ID
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

// Create a new employer
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

// Update an existing employer
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

// Delete an employer by ID
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

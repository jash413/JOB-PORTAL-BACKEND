// controllers/jobCateController.js
const JobCate = require('../models/jobCate');

// Get all job categories
exports.getAllJobCategories = async (req, res) => {
  try {
    const categories = await JobCate.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching job categories' });
  }
};

// Get a single job category by cate_code
exports.getJobCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCate.findByPk(id);
    if (category) {
      res.status(200).json(category);
    } else {
      res.status(404).json({ error: 'Job category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching job category' });
  }
};

// Create a new job category
exports.createJobCategory = async (req, res) => {
  try {
    const { cate_desc } = req.body;
    const newCategory = await JobCate.create({ cate_desc });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Error creating job category' });
  }
};

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
      res.status(404).json({ error: 'Job category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating job category' });
  }
};

// Delete a job category by cate_code
exports.deleteJobCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCate.findByPk(id);
    
    if (category) {
      await category.destroy();
      res.status(200).json({ message: 'Job category deleted' });
    } else {
      res.status(404).json({ error: 'Job category not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job category' });
  }
};

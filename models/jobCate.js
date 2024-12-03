// models/jobCate.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');  // Import the Sequelize instance (configured in db.js)

const JobCate = sequelize.define('JobCate', {
  cate_code: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  cate_desc: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'job_cate',   // Ensuring the table name is exactly 'job_cate'
  timestamps: true        // Disable automatic createdAt/updatedAt timestamps if not needed
});

module.exports = JobCate;

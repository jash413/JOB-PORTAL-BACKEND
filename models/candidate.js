// models/candidate.js
const { DataTypes } = require("sequelize");
const JobCate = require("./jobCate"); // Import JobCate model
const sequelize = require("../config/db"); // Sequelize initialized in config/db.js

const Candidate = sequelize.define(
  "Candidate",
  {
    login_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    can_code: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    can_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    can_mobn: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 10], // Assuming mobile number is 10 digits
      },
    },
    can_job_cate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    can_profile_img: {
      type: DataTypes.STRING, // Assuming this stores image file paths
      allowNull: true,
    },
    reg_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    can_about: {
      type: DataTypes.TEXT, // About candidate
      allowNull: true,
    },
    can_skill: {
      type: DataTypes.TEXT, // Candidate's skills
      allowNull: true,
    },
    can_appr: {
      type: DataTypes.BOOLEAN, // Approval status: 1 (approved), 0 (pending)
      defaultValue: false,
    },
    can_resume: {
      type: DataTypes.STRING, // Resume file path
      allowNull: true,
    },
  },
  {
    tableName: "candidate_mast", // Assuming this is the table name in your database
    timestamps: true, // CreatedAt, UpdatedAt fields
  }
);

// Define a relationship between Candidate and JobCate models
Candidate.belongsTo(JobCate, {
  foreignKey: "can_job_cate",
  as: "job_category",
});

module.exports = Candidate;

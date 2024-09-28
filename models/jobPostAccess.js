// models/JobPostAccess.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employer = require("./employer");
const Candidate = require("./candidate");
const JobPost = require("./jobPost");

const JobPostAccess = sequelize.define("JobPostAccess", {
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employer,
      key: "cmp_code",
    },
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Candidate,
      key: "can_code",
    },
  },
  jobPostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: JobPost,
      key: "job_id",
    },
  },
  grantedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = JobPostAccess;

// models/jobApplication.js
const { DataTypes } = require("sequelize");
const Candidate = require("./candidate");
const JobPost = require("./jobPost");
const sequelize = require("../config/db"); // Assuming this is where your DB config is

const JobApplication = sequelize.define("JobApplication", {
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Candidate, // Name of the Candidate model
      key: "can_code",
    },
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: JobPost, // Name of the JobPost model
      key: "job_id",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected"),
    defaultValue: "pending",
    allowNull: false,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},{
  timestamps: true,
});

JobApplication.belongsTo(Candidate, {
  foreignKey: "candidateId",
  targetKey: "can_code",
  as: "candidate",
});

JobApplication.belongsTo(JobPost, {
  foreignKey: "job_id",
  targetKey: "job_id",
  as: "job_post",
});

module.exports = JobApplication;

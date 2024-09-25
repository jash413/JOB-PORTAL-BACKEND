const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");  // Assuming sequelize config is here
const Candidate = require("../models/candidate");

const CandidateExpDetails = sequelize.define("CandidateExpDetails", {
  exp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  emp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exp_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exp_desg: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cur_ctc: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  job_stdt: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  job_endt: {
    type: DataTypes.DATEONLY,
    allowNull: true, // Nullable if the candidate is still employed
  },
  can_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "candidate_mast", 
      key: "can_code",
    },
  },
});
// Define a relationship between Candidate and JobCate models
CandidateExpDetails.belongsTo(Candidate, {
  foreignKey: "can_code",
  as: "candidate",
});

module.exports = CandidateExpDetails;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");  // Assuming sequelize config is here

const CandidateExpDetails = sequelize.define("candidate_exp_details", {
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
  },
},{
  timestamps: true,
});


module.exports = CandidateExpDetails;

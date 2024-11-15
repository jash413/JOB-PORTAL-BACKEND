const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // assuming you have a config file for db connection

const CandidateEducation = sequelize.define(
  "CandidateEducation",
  {
    edu_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    can_edu: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_scho: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    can_pasy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    can_perc: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    can_stre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    can_cgpa: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    can_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "candidate_edu_details",
    timestamps: false,
  }
);

module.exports = CandidateEducation;

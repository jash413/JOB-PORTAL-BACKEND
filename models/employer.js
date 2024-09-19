// models/employer.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Assuming Sequelize is initialized in config/db.js

const Employer = sequelize.define(
  "Employer",
  {
    cmp_code: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cmp_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cmp_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    cmp_mobn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cmp_webs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emp_loca: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emp_addr: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "employer_mast",
    timestamps: true,
  }
);

module.exports = Employer;

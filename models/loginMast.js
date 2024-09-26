const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust the path if necessary

const Login = sequelize.define(
  "Login",
  {
    login_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    login_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    login_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    login_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    login_mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    login_pass: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reg_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    email_ver_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email_ver_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    phone_ver_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_ver_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "login_mast", // Assuming table name is `login_mast`
    timestamps: false, // Based on the table structure
  }
);

module.exports = Login;

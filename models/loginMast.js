const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust the path if necessary

const Login = sequelize.define(
  "Login",
  {
    login_type: {
      type: DataTypes.STRING,
      allowNull: false,
      enm: ["AMN", "CND", "EMP"],
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
      validate: {
        isEmail: true,
      },
    },
    login_mobile: {
      type: DataTypes.STRING,
      allowNull: true,
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
    user_approval_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    email_ver_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    phone_ver_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    phone_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "login_mast", // Assuming table name is `login_mast`
    timestamps: false, // Based on the table structure
  }
);

module.exports = Login;

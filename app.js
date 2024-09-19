// app.js
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middleware
app.use(express.json());

// Error handler middleware
app.use(errorHandler);

module.exports = app;

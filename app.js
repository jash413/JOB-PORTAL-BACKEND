// app.js
const express = require('express');
const docsRoutes = require('./routes/docsRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Job Portal API');
});

// Routes
app.use('/api/v1', docsRoutes);   // API docs route

// Error handler middleware
app.use(errorHandler);

module.exports = app;

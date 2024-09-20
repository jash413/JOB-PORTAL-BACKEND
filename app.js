// app.js
const express = require('express');
const expressListEndpoints = require('express-list-endpoints');
const jobCateRoutes = require('./routes/jobCateRoutes');
const employerRoutes = require('./routes/employerRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const errorHandler = require('./middlewares/errorHandler');


const app = express();

// Middleware
app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Job Portal API');
});

// Use the jobCate routes
app.use('/api/v1', jobCateRoutes);

// Use the employer routes
app.use('/api/v1', employerRoutes);

// Use the candidate routes
app.use('/api/v1', candidateRoutes);

// Route to list employer routes
app.get('/api/v1/employer-routes', (req, res) => {
  res.send(expressListEndpoints(employerRoutes));
});

// Route to list candidate routes
app.get('/api/v1/candidate-routes', (req, res) => {
  res.send(expressListEndpoints(candidateRoutes));
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;

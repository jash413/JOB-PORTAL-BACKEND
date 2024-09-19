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

// Route to list all available API endpoints
app.get('/api/v1/routes', (req, res) => {
  const routes = expressListEndpoints(app);
  res.json(routes);
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;

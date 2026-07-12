const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware (Example of global middleware)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', routes);

// 404 Handler for undefined routes
app.use(notFoundHandler);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;

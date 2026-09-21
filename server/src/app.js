const express = require('express');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Health-check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ANIVOM API is running',
  });
});

module.exports = app;

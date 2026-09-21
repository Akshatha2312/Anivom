const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS middleware for allowed frontend origins
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// Health-check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ANIVOM API is running',
  });
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);



module.exports = app;


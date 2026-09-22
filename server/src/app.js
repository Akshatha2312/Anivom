const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ANIVOM API is running',
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);

app.use(errorMiddleware);

module.exports = app;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const limiter = require('./middlewares/rateLimiter');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter); // Apply rate limiting to all requests

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;

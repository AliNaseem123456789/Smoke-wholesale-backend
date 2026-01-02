// app.js
const express = require('express');
const cors = require('cors');

// const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const testRoutes = require('./routes/test.routes');

const app = express();

app.use(cors());
app.use(express.json());

// app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/test', testRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'Backend is running 🚀' });
});

module.exports = app;

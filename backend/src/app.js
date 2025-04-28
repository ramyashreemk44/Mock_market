const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const config = require('./config/default');
const stockRoutes = require('./routes/stocks');
const tradeRoutes = require('./routes/trades');
const watchlistRoutes = require('./routes/watchlist');
const portfolioRoutes = require('./routes/portfolio');
const chartRoutes = require('./routes/charts');
const notificationRoutes = require('./routes/notifications');
const { startPriceMonitoring } = require('./services/priceMonitoringService');
require('./services/notificationScheduler');



// Import routes
const authRoutes = require('./routes/auth');

// Initialize express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/notifications', notificationRoutes);



// Health check routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to MockMarket API',
    status: 'active',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({
    service: 'MockMarket API',
    status: 'healthy',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: config.env === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`
=================================
🚀 Server is running!
📡 Port: ${config.port}
🌍 Environment: ${config.env}
🔗 URL: http://localhost:${config.port}
=================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
startPriceMonitoring();
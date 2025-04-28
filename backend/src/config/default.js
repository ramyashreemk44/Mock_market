require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  alphaVantageApiKey: process.env.alphaVantageApiKey,
  env: process.env.NODE_ENV || 'development',
  dbName: 'mockmarket'
};
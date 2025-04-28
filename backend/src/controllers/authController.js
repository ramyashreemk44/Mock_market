// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        email,
        password,
        name
      });

      await user.save();

      // Create portfolio for new user
      const portfolio = new Portfolio({
        userId: user._id,
        holdings: [],
        totalValue: 0
      });

      await portfolio.save();

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      // Return user data and token
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error in user registration', error: error.message });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      // Return user data and token
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error in user login' });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  }
};

module.exports = authController;
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PRICE_ALERT', 'TRADE_CONFIRMATION', 'SYSTEM'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  symbol: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
notificationSchema.index({ userId: 1, timestamp: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
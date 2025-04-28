const Notification = require('../models/Notification');

const createNotification = async (userId, type, message, symbol = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      message,
      symbol,
      read: false,
      timestamp: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = { createNotification };
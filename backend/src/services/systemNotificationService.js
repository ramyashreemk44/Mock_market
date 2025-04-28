const { createNotification } = require('../utils/notificationUtils');
const User = require('../models/User');

const systemNotificationService = {
  // Notify all users
  notifyAll: async (message) => {
    try {
      const users = await User.find({}, '_id');
      await Promise.all(
        users.map(user => 
          createNotification(user._id, 'SYSTEM', message)
        )
      );
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  },

  // Notify specific user
  notifyUser: async (userId, message) => {
    try {
      await createNotification(userId, 'SYSTEM', message);
    } catch (error) {
      console.error('Error sending user notification:', error);
    }
  },

  // Example system notifications
  notifyLowBalance: async (userId, balance) => {
    await createNotification(
      userId,
      'SYSTEM',
      `Your account balance is low: ${formatCurrency(balance)}`
    );
  },

  notifyMarketStatus: async (isOpen) => {
    const message = isOpen 
      ? 'Market is now open for trading'
      : 'Market is now closed';
    
    await systemNotificationService.notifyAll(message);
  }
};

module.exports = systemNotificationService;
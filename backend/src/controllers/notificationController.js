const Notification = require('../models/Notification');

const notificationController = {
  // Get all notifications for a user
  getNotifications: async (req, res) => {
    try {
      const userId = req.user._id;
      const notifications = await Notification.find({ userId })
        .sort({ timestamp: -1 })
        .limit(50); // Limit to last 50 notifications

      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  },

  // Mark a notification as read
  markAsRead: async (req, res) => {
    try {
      const userId = req.user._id;
      const { notificationId } = req.params;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error updating notification' });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user._id;
      await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Error updating notifications' });
    }
  },

  // Create a new notification (internal use)
  createNotification: async (userId, type, message, symbol = null) => {
    try {
      const notification = new Notification({
        userId,
        type,
        message,
        symbol
      });
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
};

module.exports = notificationController;
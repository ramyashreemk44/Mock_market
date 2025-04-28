import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());

  const fetchNotifications = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true);
      const data = await notificationService.getNotifications();
      
      // Check if we have new notifications
      const hasNewNotifications = data.some(newNotif => {
        const existingNotif = notifications.find(existing => existing._id === newNotif._id);
        return !existingNotif || existingNotif.read !== newNotif.read;
      });

      if (hasNewNotifications) {
        setNotifications(data);
        setLastFetched(new Date());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [notifications]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchNotifications(true); // Initial fetch with loading indicator

    // Set up polling every 15 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications(false); // Regular polling without loading indicator
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [fetchNotifications]);

  // Additional polling when dropdown is open
  useEffect(() => {
    if (showDropdown) {
      const frequentPollInterval = setInterval(() => {
        fetchNotifications(false);
      }, 5000); // Poll more frequently when dropdown is open

      return () => clearInterval(frequentPollInterval);
    }
  }, [showDropdown, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await notificationService.markAsRead(notification._id);
        // Update the local state immediately
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      }
      
      // Navigate based on notification type
      if (notification.type === 'PRICE_ALERT' && notification.symbol) {
        setShowDropdown(false);
        navigate(`/trading?symbol=${notification.symbol}`);
      }
      
      if (notification.type === 'TRADE_CONFIRMATION' && notification.symbol) {
        setShowDropdown(false);
        navigate(`/portfolio`);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setIsLoading(true);
      await notificationService.markAllAsRead();
      // Update local state immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.notification-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="relative notification-dropdown">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isLoading || !unreadCount}
                  className={`text-sm text-blue-600 hover:text-blue-800 ${
                    (!unreadCount || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {notification.symbol && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {notification.symbol}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t text-xs text-gray-500 text-right">
            Last updated: {lastFetched.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
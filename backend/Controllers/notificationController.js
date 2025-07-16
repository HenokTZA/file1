const notificationService = require('../Services/notificationService');
const { sendResponse } = require('../utils/responseHandler');

exports.getUserNotifications = async (req, res) => {
  try {
    const { Notification } = req.tenantModels;
    const userId = req.user._id;

    const notifications = await notificationService.getUserNotifications(userId, Notification);
    sendResponse(res, 200, 'Notifications fetched successfully', notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    sendResponse(res, 500, error.message);
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const { Notification } = req.tenantModels;
    const userId = req.user._id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, 'No notification IDs provided');
    }

    await notificationService.markAsRead(ids, Notification, userId);
    sendResponse(res, 200, 'Notifications marked as read');
  } catch (error) {
    console.error('Error marking notifications:', error);
    sendResponse(res, 500, error.message);
  }
};

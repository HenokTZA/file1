exports.createNotification = async (notificationData, NotificationModel, io = null, userSockets = {}) => {
    const notification = await NotificationModel.create(notificationData);
  
    // If using Socket.IO and the user is online, emit it in real-time
    if (io && userSockets[notification.user?.toString()]) {
      const socketId = userSockets[notification.user.toString()];
      io.to(socketId).emit("notification:new", notification);
    }
  
    return notification;
  };
  
  exports.markAsRead = async (notificationIds, NotificationModel, userId) => {
    return NotificationModel.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      { $set: { isRead: true } }
    );
  };
  
  exports.getUserNotifications = async (userId, NotificationModel) => {
    return NotificationModel.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
  };
  
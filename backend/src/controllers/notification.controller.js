const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

class NotificationController {
  getNotifications = asyncHandler(async (req, res) => {
    const data = await notificationService.getNotifications(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, data, 'Notifications retrieved successfully'));
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const data = await notificationService.getUnreadCount(req.user.id);
    res.status(200).json(new ApiResponse(200, data, 'Unread count retrieved successfully'));
  });

  markAsRead = asyncHandler(async (req, res) => {
    try {
      await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json(new ApiResponse(200, null, 'Notification marked as read'));
    } catch (error) {
      throw new ApiError(404, error.message);
    }
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
  });

  broadcast = asyncHandler(async (req, res) => {
    const data = await notificationService.broadcast(req.body);
    res.status(200).json(new ApiResponse(200, data, 'Broadcast sent successfully'));
  });
}

module.exports = new NotificationController();

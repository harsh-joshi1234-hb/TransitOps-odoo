const notificationRepository = require('../repositories/notification.repository');
const prisma = require('../config/prisma');

class NotificationService {
  async getNotifications(userId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = Math.min(Number(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [list, total] = await notificationRepository.getNotifications(userId, {
      ...query,
      skip,
      take: limit
    });

    return {
      list,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUnreadCount(userId) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { unreadCount: count };
  }

  async markAsRead(id, userId) {
    const result = await notificationRepository.markAsRead(id, userId);
    if (result.count === 0) {
      throw new Error('Notification not found or already read');
    }
    return { success: true };
  }

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return { success: true };
  }

  async broadcast(data) {
    let users = [];
    if (data.targetRole) {
      users = await notificationRepository.getUsersByRole(data.targetRole);
    } else {
      users = await notificationRepository.getAllUsers();
    }

    if (users.length === 0) return { success: true, count: 0 };

    const notifications = users.map(u => ({
      title: data.title,
      message: data.message,
      priority: data.priority || 'NORMAL',
      userId: u.id
    }));

    const result = await notificationRepository.createBroadcast(notifications);
    return { success: true, count: result.count };
  }

  // Hook for internal services
  async createNotification(data) {
    try {
      await notificationRepository.createNotification(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
      // We swallow the error so notification failure doesn't roll back core ERP flows
    }
  }

  async notifyRole(roleName, data) {
    try {
      const users = await notificationRepository.getUsersByRole(roleName);
      if (users.length === 0) return;

      const notifications = users.map((u, i) => ({
        notificationNumber: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 10000) + i}`,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'NORMAL',
        userId: u.id,
        relatedEntity: data.relatedEntity,
        relatedEntityId: data.relatedEntityId
      }));

      await prisma.notification.createMany({ data: notifications });
    } catch (error) {
      console.error('Failed to notify role:', error);
    }
  }
}

module.exports = new NotificationService();

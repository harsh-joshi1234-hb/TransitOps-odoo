const prisma = require('../config/prisma');

class NotificationRepository {
  async getNotifications(userId, { skip, take, isRead, type, priority, startDate, endDate }) {
    const where = { userId };
    
    if (isRead !== undefined) where.isRead = isRead === 'true' || isRead === true;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
    }

    return Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where })
    ]);
  }

  async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false }
    });
  }

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
  }

  async createNotification(data) {
    return prisma.notification.create({
      data: {
        notificationNumber: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'NORMAL',
        userId: data.userId,
        relatedEntity: data.relatedEntity,
        relatedEntityId: data.relatedEntityId,
        metadata: data.metadata || {}
      }
    });
  }

  async createBroadcast(data) {
    // Generate the unique string upfront if not using createMany default generator
    return prisma.notification.createMany({
      data: data.map(n => ({
        notificationNumber: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        title: n.title,
        message: n.message,
        type: 'SYSTEM',
        priority: n.priority || 'NORMAL',
        userId: n.userId
      }))
    });
  }

  async getAllUsers() {
    return prisma.user.findMany({ select: { id: true } });
  }

  async getUsersByRole(roleName) {
    return prisma.user.findMany({
      where: { role: { name: roleName } },
      select: { id: true }
    });
  }
}

module.exports = new NotificationRepository();

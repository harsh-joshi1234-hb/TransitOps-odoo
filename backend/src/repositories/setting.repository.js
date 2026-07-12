const prisma = require('../config/prisma');

class SettingRepository {
  async findAll({ category, search, skip, take }) {
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return Promise.all([
      prisma.systemSetting.findMany({
        where,
        skip,
        take,
        orderBy: { key: 'asc' },
        select: {
          key: true,
          value: true,
          type: true,
          category: true,
          description: true,
          isEditable: true,
          updatedAt: true
        }
      }),
      prisma.systemSetting.count({ where })
    ]);
  }

  async findByKey(key) {
    return prisma.systemSetting.findUnique({
      where: { key }
    });
  }

  async create(data) {
    return prisma.systemSetting.create({
      data,
      select: {
        key: true,
        value: true,
        type: true,
        category: true,
        description: true,
        isEditable: true
      }
    });
  }

  async update(key, data) {
    return prisma.systemSetting.update({
      where: { key },
      data,
      select: {
        key: true,
        value: true,
        type: true,
        category: true,
        description: true,
        isEditable: true
      }
    });
  }

  async delete(key) {
    return prisma.systemSetting.delete({
      where: { key }
    });
  }

  async seedMany(settings) {
    return prisma.systemSetting.createMany({
      data: settings,
      skipDuplicates: true
    });
  }
}

module.exports = new SettingRepository();

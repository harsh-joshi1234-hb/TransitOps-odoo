const settingRepository = require('../repositories/setting.repository');
const ApiError = require('../utils/apiError');

class SettingService {
  async getAllSettings(query) {
    const { category, search, page = 1, limit = 20 } = query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = Math.min(parseInt(limit, 10), 100);
    
    if (parsedPage < 1 || parsedLimit < 1) {
      throw new ApiError(400, 'Page and limit must be positive integers');
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [settings, total] = await settingRepository.findAll({
      category,
      search,
      skip,
      take: parsedLimit
    });

    return {
      settings,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  }

  async getSettingByKey(key) {
    const setting = await settingRepository.findByKey(key.toUpperCase());
    if (!setting) {
      throw new ApiError(404, `Setting with key ${key} not found`);
    }
    return setting;
  }

  async createSetting(data) {
    data.key = data.key.toUpperCase();
    
    const existing = await settingRepository.findByKey(data.key);
    if (existing) {
      throw new ApiError(409, `Setting with key ${data.key} already exists`);
    }

    return settingRepository.create(data);
  }

  async updateSetting(key, data) {
    const uppercaseKey = key.toUpperCase();
    const existing = await settingRepository.findByKey(uppercaseKey);
    
    if (!existing) {
      throw new ApiError(404, `Setting with key ${uppercaseKey} not found`);
    }

    if (!existing.isEditable) {
      throw new ApiError(403, `Setting ${uppercaseKey} is protected and cannot be edited`);
    }

    // Do not allow changing key name on update
    delete data.key;

    return settingRepository.update(uppercaseKey, data);
  }

  async deleteSetting(key) {
    const uppercaseKey = key.toUpperCase();
    const existing = await settingRepository.findByKey(uppercaseKey);
    
    if (!existing) {
      throw new ApiError(404, `Setting with key ${uppercaseKey} not found`);
    }

    if (!existing.isEditable) {
      throw new ApiError(403, `Setting ${uppercaseKey} is protected and cannot be deleted`);
    }

    await settingRepository.delete(uppercaseKey);
    return { success: true };
  }

  async seedDefaultSettings() {
    const defaults = [
      { key: 'COMPANY_NAME', value: 'TransitOps Inc.', type: 'STRING', category: 'COMPANY', description: 'Name of the company', isEditable: true },
      { key: 'DEFAULT_CURRENCY', value: 'USD', type: 'STRING', category: 'GENERAL', description: 'Default system currency', isEditable: true },
      { key: 'TIMEZONE', value: 'UTC', type: 'STRING', category: 'GENERAL', description: 'System timezone', isEditable: true },
      { key: 'DISTANCE_UNIT', value: 'km', type: 'STRING', category: 'GENERAL', description: 'Unit for distance', isEditable: true },
      { key: 'WEIGHT_UNIT', value: 'kg', type: 'STRING', category: 'GENERAL', description: 'Unit for weight', isEditable: true },
      { key: 'FUEL_UNIT', value: 'liters', type: 'STRING', category: 'GENERAL', description: 'Unit for fuel', isEditable: true },
      { key: 'MAINTENANCE_THRESHOLD_KM', value: '10000', type: 'NUMBER', category: 'MAINTENANCE', description: 'Distance threshold for preventive maintenance', isEditable: true },
      { key: 'LICENSE_REMINDER_DAYS', value: '30', type: 'NUMBER', category: 'COMPANY', description: 'Days before license expiry to trigger reminder', isEditable: true },
      { key: 'NOTIFICATION_RETENTION_DAYS', value: '90', type: 'NUMBER', category: 'NOTIFICATION', description: 'How long to keep read notifications', isEditable: true },
      { key: 'DEFAULT_PAGINATION_LIMIT', value: '10', type: 'NUMBER', category: 'SYSTEM', description: 'Default pagination limit', isEditable: true },
      { key: 'MAXIMUM_PAGINATION_LIMIT', value: '100', type: 'NUMBER', category: 'SYSTEM', description: 'Hard pagination limit', isEditable: false },
      { key: 'JWT_EXPIRY', value: '24h', type: 'STRING', category: 'SECURITY', description: 'JWT authentication token expiry', isEditable: false }
    ];

    try {
      const result = await settingRepository.seedMany(defaults);
      console.log(`Seeded ${result.count} default system settings.`);
      return result;
    } catch (error) {
      console.error('Error seeding default settings:', error.message);
    }
  }
}

module.exports = new SettingService();

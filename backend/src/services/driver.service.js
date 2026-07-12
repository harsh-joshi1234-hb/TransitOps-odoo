const driverRepository = require('../repositories/driver.repository');
const ApiError = require('../utils/apiError');

class DriverService {
  async _checkUniqueConstraints(data, excludeDriverId = null) {
    if (data.licenseNumber) {
      const existing = await driverRepository.findDriverByLicense(data.licenseNumber);
      if (existing && existing.id !== excludeDriverId) {
        throw new ApiError(409, `License number ${data.licenseNumber} is already registered`);
      }
    }
    
    if (data.email) {
      const existing = await driverRepository.findDriverByEmail(data.email.trim().toLowerCase());
      if (existing && existing.id !== excludeDriverId) {
        throw new ApiError(409, `Email ${data.email} is already in use`);
      }
      data.email = data.email.trim().toLowerCase(); // Sanitize
    }

    if (data.contactNumber) {
      const existing = await driverRepository.findDriverByContactNumber(data.contactNumber);
      if (existing && existing.id !== excludeDriverId) {
        throw new ApiError(409, `Contact number ${data.contactNumber} is already in use`);
      }
    }
  }

  _validateBusinessRules(data) {
    if (data.licenseExpiryDate) {
      if (new Date(data.licenseExpiryDate) <= new Date()) {
        throw new ApiError(400, 'License expiry date must be in the future');
      }
    }

    if (data.safetyScore !== undefined) {
      if (data.safetyScore < 0 || data.safetyScore > 100) {
        throw new ApiError(400, 'Safety score must be between 0 and 100');
      }
    }
  }

  async createDriver(data) {
    await this._checkUniqueConstraints(data);
    this._validateBusinessRules(data);

    return driverRepository.createDriver(data);
  }

  async getDriverById(id) {
    const driver = await driverRepository.findDriverById(id);
    if (!driver) {
      throw new ApiError(404, 'Driver not found');
    }
    return driver;
  }

  async getAllDrivers(query) {
    const { status, safetyScore, expiringSoon, isDeleted, search, sortBy, sortOrder, page = 1, limit = 10 } = query;

    const filters = { status, safetyScore, expiringSoon, isDeleted, search };
    const sort = { sortBy, sortOrder };
    
    // Pagination calculation
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    
    if (parsedPage < 1 || parsedLimit < 1) {
      throw new ApiError(400, 'Page and limit must be positive integers');
    }

    const pagination = {
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
    };

    const { drivers, total } = await driverRepository.findAllDrivers({ filters, sort, pagination });
    
    return {
      drivers,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      }
    };
  }

  async updateDriver(id, data) {
    const driver = await this.getDriverById(id);

    if (driver.isDeleted) {
      throw new ApiError(400, 'Cannot update a deleted driver. Please restore them first.');
    }

    await this._checkUniqueConstraints(data, id);
    this._validateBusinessRules(data);

    return driverRepository.updateDriver(id, data);
  }

  async updateSafetyScore(id, safetyScore) {
    const driver = await this.getDriverById(id);

    if (driver.isDeleted) {
      throw new ApiError(400, 'Cannot update a deleted driver.');
    }

    this._validateBusinessRules({ safetyScore });

    return driverRepository.updateDriver(id, { safetyScore });
  }

  async softDeleteDriver(id) {
    const driver = await this.getDriverById(id);

    if (driver.status === 'ON_TRIP') {
      throw new ApiError(400, 'Cannot delete a driver currently assigned to a trip');
    }

    if (driver.isDeleted) {
      throw new ApiError(400, 'Driver is already deleted');
    }

    return driverRepository.softDeleteDriver(id);
  }

  async restoreDriver(id) {
    const driver = await this.getDriverById(id);
    
    if (!driver.isDeleted) {
      throw new ApiError(400, 'Driver is not deleted');
    }

    return driverRepository.restoreDriver(id);
  }
}

module.exports = new DriverService();

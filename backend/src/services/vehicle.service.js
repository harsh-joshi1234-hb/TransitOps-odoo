const vehicleRepository = require('../repositories/vehicle.repository');
const notificationService = require('./notification.service');
const ApiError = require('../utils/apiError');

class VehicleService {
  async createVehicle(data) {
    const { registrationNumber, maxLoadCapacity, acquisitionCost, odometer } = data;

    // Business Logic: Registration Number must be unique
    const existingVehicle = await vehicleRepository.findVehicleByRegNumber(registrationNumber);
    if (existingVehicle) {
      throw new ApiError(409, `Vehicle with registration number ${registrationNumber} already exists`);
    }

    // Business Logic: Capacity > 0, cost >= 0, odometer >= 0
    if (maxLoadCapacity <= 0) {
      throw new ApiError(400, 'Maximum load capacity must be greater than 0');
    }
    if (acquisitionCost < 0) {
      throw new ApiError(400, 'Acquisition cost cannot be negative');
    }
    if (odometer < 0) {
      throw new ApiError(400, 'Odometer reading cannot be negative');
    }

    return vehicleRepository.createVehicle(data);
  }

  async getVehicleById(id) {
    const vehicle = await vehicleRepository.findVehicleById(id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }
    return vehicle;
  }

  async getAllVehicles(query) {
    const { status, type, isDeleted, search, sortBy, sortOrder, page = 1, limit = 10 } = query;

    const filters = { status, type, isDeleted, search };
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

    const { vehicles, total } = await vehicleRepository.findAllVehicles({ filters, sort, pagination });
    
    return {
      vehicles,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      }
    };
  }

  async updateVehicle(id, data) {
    const vehicle = await this.getVehicleById(id);

    // Business Logic: Cannot update deleted vehicles
    if (vehicle.isDeleted) {
      throw new ApiError(400, 'Cannot update a deleted vehicle. Please restore it first.');
    }

    // Check unique registration if updating registration number
    if (data.registrationNumber && data.registrationNumber !== vehicle.registrationNumber) {
      const existingVehicle = await vehicleRepository.findVehicleByRegNumber(data.registrationNumber);
      if (existingVehicle) {
        throw new ApiError(409, `Vehicle with registration number ${data.registrationNumber} already exists`);
      }
    }

    // Check numerical constraints if updating them
    if (data.maxLoadCapacity !== undefined && data.maxLoadCapacity <= 0) {
      throw new ApiError(400, 'Maximum load capacity must be greater than 0');
    }
    if (data.acquisitionCost !== undefined && data.acquisitionCost < 0) {
      throw new ApiError(400, 'Acquisition cost cannot be negative');
    }
    if (data.odometer !== undefined && data.odometer < 0) {
      throw new ApiError(400, 'Odometer reading cannot be negative');
    }

    const updatedVehicle = await vehicleRepository.updateVehicle(id, data);

    // Business Logic: Notifications for status changes
    if (data.status && data.status !== vehicle.status) {
      if (data.status === 'IN_SHOP') {
        await notificationService.notifyRole('Fleet Manager', {
          title: 'Vehicle In Shop',
          message: `Vehicle ${vehicle.registrationNumber} is now IN_SHOP.`,
          type: 'VEHICLE_IN_SHOP',
          priority: 'HIGH',
          relatedEntity: 'Vehicle',
          relatedEntityId: vehicle.id
        });
      } else if (data.status === 'AVAILABLE') {
        await notificationService.notifyRole('Fleet Manager', {
          title: 'Vehicle Available',
          message: `Vehicle ${vehicle.registrationNumber} is now AVAILABLE.`,
          type: 'VEHICLE_AVAILABLE',
          priority: 'NORMAL',
          relatedEntity: 'Vehicle',
          relatedEntityId: vehicle.id
        });
      }
    }

    return updatedVehicle;
  }

  async softDeleteVehicle(id) {
    const vehicle = await this.getVehicleById(id);

    // Business Logic: Cannot delete if ON_TRIP or IN_SHOP
    if (vehicle.status === 'ON_TRIP' || vehicle.status === 'IN_SHOP') {
      throw new ApiError(400, `Cannot delete vehicle because its current status is ${vehicle.status}`);
    }

    if (vehicle.isDeleted) {
      throw new ApiError(400, 'Vehicle is already deleted');
    }

    return vehicleRepository.softDeleteVehicle(id);
  }

  async restoreVehicle(id) {
    const vehicle = await this.getVehicleById(id);
    
    if (!vehicle.isDeleted) {
      throw new ApiError(400, 'Vehicle is not deleted');
    }

    return vehicleRepository.restoreVehicle(id);
  }
}

module.exports = new VehicleService();

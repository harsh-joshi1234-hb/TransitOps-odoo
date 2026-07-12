const fuelRepository = require('../repositories/fuel.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

class FuelService {
  async _generateFuelLogNumber() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `FUEL-${todayStr}-`;
    
    const latestFuelLog = await fuelRepository.getLatestFuelLogForDate(prefix);
    
    let nextSequence = 1;
    if (latestFuelLog && latestFuelLog.fuelLogNumber) {
      const lastSequence = parseInt(latestFuelLog.fuelLogNumber.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
    
    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }

  async _validateResources(vehicleId, fuelType, liters, tripId, odometer) {
    const vehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
    if (vehicle.isDeleted) throw new ApiError(400, 'Cannot add fuel for a deleted vehicle');

    if (fuelType !== vehicle.fuelType) {
      throw new ApiError(400, `Fuel type mismatch. Vehicle requires ${vehicle.fuelType}, but ${fuelType} was provided.`);
    }

    if (vehicle.fuelTankCapacity && liters > vehicle.fuelTankCapacity) {
      throw new ApiError(400, `Fuel theft/fraud alert: Liters provided (${liters}) exceeds vehicle tank capacity (${vehicle.fuelTankCapacity})`);
    }

    if (odometer < vehicle.odometer) {
      throw new ApiError(400, `Odometer anomaly: Provided odometer (${odometer}) is less than current vehicle odometer (${vehicle.odometer})`);
    }

    if (tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new ApiError(404, 'Trip not found');
      if (trip.status === 'CANCELLED') throw new ApiError(400, 'Cannot assign fuel to a CANCELLED trip');
      if (trip.vehicleId !== vehicleId) throw new ApiError(400, 'Trip is not assigned to this vehicle');
    }
  }

  async createFuelLog(data, userId) {
    await this._validateResources(data.vehicleId, data.fuelType, data.liters, data.tripId, data.odometer);

    // Calculate total cost strictly
    data.totalCost = parseFloat((data.liters * data.pricePerLiter).toFixed(2));
    
    data.fuelLogNumber = await this._generateFuelLogNumber();
    data.createdByUserId = userId;
    
    return fuelRepository.createFuelLog(data);
  }

  async getFuelLogById(id) {
    const fuelLog = await fuelRepository.findFuelLogById(id);
    if (!fuelLog) {
      throw new ApiError(404, 'Fuel log not found');
    }
    return fuelLog;
  }

  async getAllFuelLogs(query) {
    const { status, vehicleId, tripId, fuelType, search, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const filters = { status, vehicleId, tripId, fuelType, search };
    const sort = { sortBy, sortOrder };
    
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (parsedPage < 1 || parsedLimit < 1) throw new ApiError(400, 'Page and limit must be positive integers');

    const pagination = { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit };

    const { fuelLogs, total } = await fuelRepository.findAllFuelLogs({ filters, sort, pagination });
    return {
      fuelLogs,
      meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) }
    };
  }

  async updateFuelLog(id, data) {
    const fuelLog = await this.getFuelLogById(id);
    
    if (!['DRAFT', 'REJECTED'].includes(fuelLog.status)) {
      throw new ApiError(400, `Cannot update fuel log that is currently ${fuelLog.status}. Only DRAFT or REJECTED logs can be modified.`);
    }

    const newVehicleId = data.vehicleId || fuelLog.vehicleId;
    const newFuelType = data.fuelType || fuelLog.fuelType;
    const newLiters = data.liters !== undefined ? data.liters : fuelLog.liters;
    const newTripId = data.tripId !== undefined ? data.tripId : fuelLog.tripId;
    const newOdometer = data.odometer !== undefined ? data.odometer : fuelLog.odometer;

    await this._validateResources(newVehicleId, newFuelType, newLiters, newTripId, newOdometer);

    if (data.liters !== undefined || data.pricePerLiter !== undefined) {
      const litersToUse = data.liters !== undefined ? data.liters : fuelLog.liters;
      const priceToUse = data.pricePerLiter !== undefined ? data.pricePerLiter : fuelLog.pricePerLiter;
      data.totalCost = parseFloat((litersToUse * priceToUse).toFixed(2));
    }

    return fuelRepository.updateFuelLog(id, data);
  }

  async submitFuelLog(id) {
    const fuelLog = await this.getFuelLogById(id);
    if (!['DRAFT', 'REJECTED'].includes(fuelLog.status)) {
      throw new ApiError(400, `Fuel log cannot be submitted from status: ${fuelLog.status}`);
    }

    return fuelRepository.updateFuelLog(id, {
      status: 'SUBMITTED',
      submittedAt: new Date()
    });
  }

  async approveFuelLog(id, userId) {
    const fuelLog = await this.getFuelLogById(id);
    if (fuelLog.status !== 'SUBMITTED') {
      throw new ApiError(400, `Fuel log must be SUBMITTED to be approved. Current status: ${fuelLog.status}`);
    }

    return fuelRepository.approveFuelLog(id, fuelLog.vehicleId, fuelLog.odometer, userId);
  }

  async rejectFuelLog(id) {
    const fuelLog = await this.getFuelLogById(id);
    if (fuelLog.status !== 'SUBMITTED') {
      throw new ApiError(400, `Fuel log must be SUBMITTED to be rejected. Current status: ${fuelLog.status}`);
    }

    return fuelRepository.updateFuelLog(id, {
      status: 'REJECTED',
      rejectedAt: new Date()
    });
  }

  async softDeleteFuelLog(id) {
    const fuelLog = await this.getFuelLogById(id);
    if (fuelLog.status === 'APPROVED') {
      throw new ApiError(400, 'Cannot delete an APPROVED fuel log. It is locked for financial auditing.');
    }

    return fuelRepository.softDeleteFuelLog(id);
  }

  async getTimeline(id) {
    const fuelLog = await this.getFuelLogById(id);
    
    return {
      fuelLogNumber: fuelLog.fuelLogNumber,
      status: fuelLog.status,
      createdAt: fuelLog.createdAt,
      filledAt: fuelLog.filledAt,
      submittedAt: fuelLog.submittedAt,
      approvedAt: fuelLog.approvedAt,
      rejectedAt: fuelLog.rejectedAt,
    };
  }
}

module.exports = new FuelService();

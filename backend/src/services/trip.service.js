const tripRepository = require('../repositories/trip.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const driverRepository = require('../repositories/driver.repository');
const notificationService = require('./notification.service');
const ApiError = require('../utils/apiError');

class TripService {
  async _generateTripNumber() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TRP-${todayStr}-`;
    
    const latestTrip = await tripRepository.getLatestTripForDate(prefix);
    
    let nextSequence = 1;
    if (latestTrip && latestTrip.tripNumber) {
      const lastSequence = parseInt(latestTrip.tripNumber.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
    
    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }

  async _validateResources(vehicleId, driverId, cargoWeight) {
    const vehicle = await vehicleRepository.findVehicleById(vehicleId);
    if (!vehicle) throw new ApiError(404, 'Assigned vehicle not found');
    if (vehicle.isDeleted) throw new ApiError(400, 'Cannot assign a deleted vehicle');

    const driver = await driverRepository.findDriverById(driverId);
    if (!driver) throw new ApiError(404, 'Assigned driver not found');
    if (driver.isDeleted) throw new ApiError(400, 'Cannot assign a deleted driver');

    if (cargoWeight > vehicle.maxLoadCapacity) {
      throw new ApiError(400, `Cargo weight (${cargoWeight}) exceeds vehicle maximum capacity (${vehicle.maxLoadCapacity})`);
    }

    return { vehicle, driver };
  }

  async createTrip(data, userId) {
    const { vehicleId, driverId, cargoWeight, plannedEndTime } = data;
    
    const { driver } = await this._validateResources(vehicleId, driverId, cargoWeight);
    
    if (plannedEndTime && new Date(driver.licenseExpiryDate) < new Date(plannedEndTime)) {
      throw new ApiError(400, 'Driver license will expire before the planned end time of the trip');
    }

    data.tripNumber = await this._generateTripNumber();
    data.createdByUserId = userId;
    
    return tripRepository.createTrip(data);
  }

  async getTripById(id) {
    const trip = await tripRepository.findTripById(id);
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }
    return trip;
  }

  async getAllTrips(query) {
    const { status, priority, search, vehicleId, driverId, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const filters = { status, priority, search, vehicleId, driverId };
    const sort = { sortBy, sortOrder };
    
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (parsedPage < 1 || parsedLimit < 1) throw new ApiError(400, 'Page and limit must be positive integers');

    const pagination = { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit };

    const { trips, total } = await tripRepository.findAllTrips({ filters, sort, pagination });
    return {
      trips,
      meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) }
    };
  }

  async updateTrip(id, data) {
    const trip = await this.getTripById(id);
    
    if (!['DRAFT', 'READY'].includes(trip.status)) {
      throw new ApiError(400, `Cannot update a trip that is currently ${trip.status}. It is immutable.`);
    }

    // Re-validate if core resources change
    const vId = data.vehicleId || trip.vehicleId;
    const dId = data.driverId || trip.driverId;
    const cw = data.cargoWeight !== undefined ? data.cargoWeight : trip.cargoWeight;
    
    await this._validateResources(vId, dId, cw);

    return tripRepository.updateTrip(id, data);
  }

  async dispatchTrip(id) {
    const trip = await this.getTripById(id);
    if (trip.status !== 'DRAFT' && trip.status !== 'READY') {
      throw new ApiError(400, `Trip cannot be dispatched from status: ${trip.status}`);
    }

    const { vehicle, driver } = await this._validateResources(trip.vehicleId, trip.driverId, trip.cargoWeight);

    if (vehicle.status !== 'AVAILABLE') throw new ApiError(400, `Vehicle is not AVAILABLE (Current: ${vehicle.status})`);
    if (driver.status !== 'AVAILABLE') throw new ApiError(400, `Driver is not AVAILABLE (Current: ${driver.status})`);

    const updatedTrip = await tripRepository.dispatchTrip(id, trip.vehicleId, trip.driverId);
    
    await notificationService.createNotification({
      title: 'Trip Dispatched',
      message: `Trip ${trip.tripNumber} has been dispatched.`,
      type: 'TRIP_DISPATCHED',
      priority: 'NORMAL',
      userId: trip.createdByUserId,
      relatedEntity: 'Trip',
      relatedEntityId: trip.id
    });

    return updatedTrip;
  }

  async startTrip(id) {
    const trip = await this.getTripById(id);
    if (trip.status !== 'DISPATCHED') {
      throw new ApiError(400, `Only DISPATCHED trips can be started. Current status: ${trip.status}`);
    }

    return tripRepository.updateTrip(id, {
      status: 'IN_PROGRESS',
      startTime: new Date()
    });
  }

  async completeTrip(id, actualDistance, userId) {
    const trip = await this.getTripById(id);
    
    if (trip.status !== 'IN_PROGRESS') {
      throw new ApiError(400, `Trip must be IN_PROGRESS to be completed. Current status: ${trip.status}`);
    }

    if (actualDistance === undefined || actualDistance < 0) {
      throw new ApiError(400, 'A valid actualDistance is required to complete the trip');
    }

    const updatedTrip = await tripRepository.completeTrip(id, trip.vehicleId, trip.driverId, actualDistance, new Date(), userId);

    await notificationService.createNotification({
      title: 'Trip Completed',
      message: `Trip ${trip.tripNumber} has been completed.`,
      type: 'TRIP_COMPLETED',
      priority: 'NORMAL',
      userId: trip.createdByUserId,
      relatedEntity: 'Trip',
      relatedEntityId: trip.id
    });

    return updatedTrip;
  }

  async cancelTrip(id) {
    const trip = await this.getTripById(id);
    
    if (['COMPLETED', 'CANCELLED'].includes(trip.status)) {
      throw new ApiError(400, `Trip cannot be cancelled because it is already ${trip.status}`);
    }

    return tripRepository.cancelTrip(id, trip.vehicleId, trip.driverId, trip.status);
  }
}

module.exports = new TripService();

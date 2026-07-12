const maintenanceRepository = require('../repositories/maintenance.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const notificationService = require('./notification.service');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');

class MaintenanceService {
  async _generateMaintenanceNumber() {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `MNT-${todayStr}-`;
    
    const latestMaintenance = await maintenanceRepository.getLatestMaintenanceForDate(prefix);
    
    let nextSequence = 1;
    if (latestMaintenance && latestMaintenance.maintenanceNumber) {
      const lastSequence = parseInt(latestMaintenance.maintenanceNumber.split('-')[2], 10);
      if (!isNaN(lastSequence)) {
        nextSequence = lastSequence + 1;
      }
    }
    
    return `${prefix}${String(nextSequence).padStart(4, '0')}`;
  }

  async createMaintenance(data, userId) {
    const vehicle = await vehicleRepository.findVehicleById(data.vehicleId);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found');
    if (vehicle.isDeleted) throw new ApiError(400, 'Cannot create maintenance for a deleted vehicle');

    data.maintenanceNumber = await this._generateMaintenanceNumber();
    data.reportedByUserId = userId;
    // For REQUESTED state, we use current vehicle odometer
    data.currentOdometer = vehicle.odometer;
    
    const newMaintenance = await maintenanceRepository.createMaintenance(data);

    await notificationService.createNotification({
      title: 'Maintenance Requested',
      message: `Maintenance ${newMaintenance.maintenanceNumber} has been requested for vehicle ${vehicle.registrationNumber}.`,
      type: 'MAINTENANCE_REQUESTED',
      priority: 'NORMAL',
      userId: userId,
      relatedEntity: 'Maintenance',
      relatedEntityId: newMaintenance.id
    });

    return newMaintenance;
  }

  async getMaintenanceById(id) {
    const maintenance = await maintenanceRepository.findMaintenanceById(id);
    if (!maintenance) {
      throw new ApiError(404, 'Maintenance log not found');
    }
    return maintenance;
  }

  async getAllMaintenance(query) {
    const { status, priority, maintenanceType, search, vehicleId, sortBy, sortOrder, page = 1, limit = 10 } = query;
    const filters = { status, priority, maintenanceType, search, vehicleId };
    const sort = { sortBy, sortOrder };
    
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (parsedPage < 1 || parsedLimit < 1) throw new ApiError(400, 'Page and limit must be positive integers');

    const pagination = { skip: (parsedPage - 1) * parsedLimit, take: parsedLimit };

    const { maintenanceLogs, total } = await maintenanceRepository.findAllMaintenance({ filters, sort, pagination });
    return {
      maintenanceLogs,
      meta: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) }
    };
  }

  async updateMaintenance(id, data) {
    const maintenance = await this.getMaintenanceById(id);
    
    if (!['REQUESTED', 'SCHEDULED'].includes(maintenance.status)) {
      throw new ApiError(400, `Cannot update maintenance that is currently ${maintenance.status}. It is immutable.`);
    }

    if (data.vehicleId && data.vehicleId !== maintenance.vehicleId) {
      const vehicle = await vehicleRepository.findVehicleById(data.vehicleId);
      if (!vehicle) throw new ApiError(404, 'New vehicle not found');
    }

    return maintenanceRepository.updateMaintenance(id, data);
  }

  async scheduleMaintenance(id, data, userId) {
    const maintenance = await this.getMaintenanceById(id);
    if (maintenance.status !== 'REQUESTED') {
      throw new ApiError(400, `Maintenance cannot be scheduled from status: ${maintenance.status}`);
    }

    data.status = 'SCHEDULED';
    data.approvedByUserId = userId;

    return maintenanceRepository.updateMaintenance(id, data);
  }

  async startMaintenance(id, currentOdometer) {
    const maintenance = await this.getMaintenanceById(id);
    if (maintenance.status !== 'SCHEDULED') {
      throw new ApiError(400, `Only SCHEDULED maintenance can be started. Current status: ${maintenance.status}`);
    }

    const vehicle = await vehicleRepository.findVehicleById(maintenance.vehicleId);

    // 1. Verify odometer strictly matches
    if (currentOdometer === undefined || currentOdometer !== vehicle.odometer) {
      throw new ApiError(400, `Odometer mismatch. Provided: ${currentOdometer}, Actual: ${vehicle.odometer}`);
    }

    // 2. Verify NO active Trip for this vehicle
    const activeTrips = await prisma.trip.count({
      where: {
        vehicleId: vehicle.id,
        status: {
          in: ['DISPATCHED', 'IN_PROGRESS']
        }
      }
    });

    if (activeTrips > 0) {
      throw new ApiError(400, 'Cannot start maintenance. Vehicle is currently assigned to an active trip.');
    }

    // 3. Verify no other IN_PROGRESS maintenance
    const activeMaintenance = await prisma.maintenance.count({
      where: {
        vehicleId: vehicle.id,
        status: 'IN_PROGRESS'
      }
    });

    if (activeMaintenance > 0) {
      throw new ApiError(400, 'Cannot start maintenance. Vehicle already has an active maintenance in progress.');
    }

    // Update maintenance currentOdometer to reflect exact moment of starting
    await maintenanceRepository.updateMaintenance(id, { currentOdometer });

    const updatedMaintenance = await maintenanceRepository.startMaintenance(id, vehicle.id);

    await notificationService.createNotification({
      title: 'Maintenance Started',
      message: `Maintenance ${maintenance.maintenanceNumber} has started.`,
      type: 'MAINTENANCE_STARTED',
      priority: 'NORMAL',
      userId: maintenance.reportedByUserId,
      relatedEntity: 'Maintenance',
      relatedEntityId: maintenance.id
    });

    return updatedMaintenance;
  }

  async completeMaintenance(id, actualCost, nextServiceDate, userId) {
    const maintenance = await this.getMaintenanceById(id);
    
    if (maintenance.status !== 'IN_PROGRESS') {
      throw new ApiError(400, `Maintenance must be IN_PROGRESS to be completed. Current status: ${maintenance.status}`);
    }

    if (actualCost === undefined || actualCost < 0) {
      throw new ApiError(400, 'A valid actualCost is required to complete the maintenance');
    }

    if (nextServiceDate && new Date(nextServiceDate) <= new Date(maintenance.serviceDate)) {
      throw new ApiError(400, 'nextServiceDate must be strictly greater than the serviceDate');
    }

    const updatedMaintenance = await maintenanceRepository.completeMaintenance(id, maintenance.vehicleId, actualCost, nextServiceDate, userId);

    await notificationService.createNotification({
      title: 'Maintenance Completed',
      message: `Maintenance ${maintenance.maintenanceNumber} has been completed.`,
      type: 'MAINTENANCE_COMPLETED',
      priority: 'NORMAL',
      userId: maintenance.reportedByUserId,
      relatedEntity: 'Maintenance',
      relatedEntityId: maintenance.id
    });

    return updatedMaintenance;
  }

  async cancelMaintenance(id, userId) {
    const maintenance = await this.getMaintenanceById(id);
    
    if (['COMPLETED', 'CANCELLED'].includes(maintenance.status)) {
      throw new ApiError(400, `Maintenance cannot be cancelled because it is already ${maintenance.status}`);
    }

    return maintenanceRepository.cancelMaintenance(id, maintenance.vehicleId, maintenance.status, userId);
  }

  async getTimeline(id) {
    const maintenance = await this.getMaintenanceById(id);
    
    // Derived timeline based on audit timestamps
    // In a fully event-sourced architecture we would have an explicit history table.
    // Here we use the core dates available.
    
    let duration = null;
    if (maintenance.serviceDate && maintenance.status === 'COMPLETED') {
        const end = maintenance.updatedAt; // Completion time is roughly the last update
        const start = maintenance.serviceDate;
        duration = Math.abs(end - start) / 36e5; // hours
    }

    return {
      maintenanceNumber: maintenance.maintenanceNumber,
      status: maintenance.status,
      requestedAt: maintenance.createdAt,
      scheduledAt: maintenance.approvedByUserId ? maintenance.updatedAt : null, // Approx
      startedAt: maintenance.serviceDate,
      completedAt: maintenance.status === 'COMPLETED' ? maintenance.updatedAt : null,
      durationHours: duration ? parseFloat(duration.toFixed(2)) : null
    };
  }
}

module.exports = new MaintenanceService();

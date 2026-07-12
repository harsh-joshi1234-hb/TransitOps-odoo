const tripService = require('../services/trip.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class TripController {
  createTrip = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const trip = await tripService.createTrip(req.body, userId);
    res.status(201).json(new ApiResponse(201, trip, 'Trip created successfully'));
  });

  getTripById = asyncHandler(async (req, res) => {
    const trip = await tripService.getTripById(req.params.id);
    res.status(200).json(new ApiResponse(200, trip, 'Trip retrieved successfully'));
  });

  getAllTrips = asyncHandler(async (req, res) => {
    const data = await tripService.getAllTrips(req.query);
    res.status(200).json(new ApiResponse(200, data, 'Trips retrieved successfully'));
  });

  updateTrip = asyncHandler(async (req, res) => {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, trip, 'Trip updated successfully'));
  });

  dispatchTrip = asyncHandler(async (req, res) => {
    const trip = await tripService.dispatchTrip(req.params.id);
    res.status(200).json(new ApiResponse(200, trip, 'Trip dispatched successfully'));
  });

  startTrip = asyncHandler(async (req, res) => {
    const trip = await tripService.startTrip(req.params.id);
    res.status(200).json(new ApiResponse(200, trip, 'Trip started successfully'));
  });

  completeTrip = asyncHandler(async (req, res) => {
    const { actualDistance } = req.body;
    const userId = req.user.userId;
    const trip = await tripService.completeTrip(req.params.id, actualDistance, userId);
    res.status(200).json(new ApiResponse(200, trip, 'Trip completed successfully'));
  });

  cancelTrip = asyncHandler(async (req, res) => {
    const trip = await tripService.cancelTrip(req.params.id);
    res.status(200).json(new ApiResponse(200, trip, 'Trip cancelled successfully'));
  });
}

module.exports = new TripController();

import { z } from 'zod';

export const tripSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  destination: z.string().min(1, 'Destination is required'),
  vehicleId: z.string().uuid('Valid vehicle is required'),
  driverId: z.string().uuid('Valid driver is required'),
  cargoWeight: z.number().optional(),
  plannedDistance: z.number().min(0.1, 'Distance must be > 0'),
  plannedStartTime: z.string().min(1, 'Planned start time is required'),
  plannedEndTime: z.string().min(1, 'Planned end time is required'),
});

export const completeTripSchema = z.object({
  actualDistance: z.number().min(0.1, 'Actual distance must be > 0'),
});

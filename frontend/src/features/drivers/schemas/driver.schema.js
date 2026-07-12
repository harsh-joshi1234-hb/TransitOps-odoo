import { z } from 'zod';

export const driverSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  address: z.string().optional(),
  status: z.enum(['AVAILABLE', 'ON_TRIP', 'ON_LEAVE', 'SUSPENDED']).optional(),
});

export const safetyScoreSchema = z.object({
  safetyScore: z.number().min(0).max(100, 'Score must be between 0 and 100'),
});

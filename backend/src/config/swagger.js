const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TransitOps API',
      version: '1.0.0',
      description: 'REST API documentation for the TransitOps Smart Transport Operations Platform ERP.',
    },
    servers: [
      {
        url: '/api',
        description: 'Relative API URL',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User login and identity' },
      { name: 'Vehicles', description: 'Fleet vehicle management' },
      { name: 'Drivers', description: 'Driver and license management' },
      { name: 'Trips', description: 'Dispatch and trip execution' },
      { name: 'Maintenance', description: 'Vehicle repair and service logs' },
      { name: 'Fuel', description: 'Fuel consumption and costs' },
      { name: 'Expenses', description: 'Operational financial claims' },
      { name: 'Dashboard', description: 'High-level KPIs and chart data' },
      { name: 'Reports', description: 'Aggregated operational reports' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      parameters: {
        PaginationPage: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1, minimum: 1 },
          description: 'Page number for pagination',
        },
        PaginationLimit: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          description: 'Number of items per page',
        },
        SortBy: {
          in: 'query',
          name: 'sortBy',
          schema: { type: 'string', default: 'createdAt' },
          description: 'Field to sort by',
        },
        SortOrder: {
          in: 'query',
          name: 'sortOrder',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          description: 'Sort direction',
        },
        StartDate: {
          in: 'query',
          name: 'startDate',
          schema: { type: 'string', format: 'date-time' },
          description: 'Start date for filtering (ISO 8601)',
        },
        EndDate: {
          in: 'query',
          name: 'endDate',
          schema: { type: 'string', format: 'date-time' },
          description: 'End date for filtering (ISO 8601)',
        },
        PathId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the resource',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error description' },
            stack: { type: 'string', description: 'Only available in development mode' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
                token: { type: 'string' },
              },
            },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            registrationNumber: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            fuelType: { type: 'string' },
            status: { type: 'string' },
            currentOdometer: { type: 'number' },
          },
        },
        Driver: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            licenseNumber: { type: 'string' },
            status: { type: 'string' },
            safetyScore: { type: 'number' },
          },
        },
        Trip: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tripNumber: { type: 'string' },
            status: { type: 'string' },
            vehicleId: { type: 'string', format: 'uuid' },
            driverId: { type: 'string', format: 'uuid' },
          },
        },
        Maintenance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            maintenanceNumber: { type: 'string' },
            maintenanceType: { type: 'string' },
            status: { type: 'string' },
            actualCost: { type: 'number' },
            vehicleId: { type: 'string', format: 'uuid' },
          },
        },
        FuelLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            fuelLogNumber: { type: 'string' },
            fuelType: { type: 'string' },
            status: { type: 'string' },
            totalCost: { type: 'number' },
            vehicleId: { type: 'string', format: 'uuid' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            expenseNumber: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            amount: { type: 'number' },
          },
        },
      },
    },
  },
  // Ensure we include all route files
  apis: ['./src/routes/*.routes.js'],
};

module.exports = swaggerJsdoc(options);

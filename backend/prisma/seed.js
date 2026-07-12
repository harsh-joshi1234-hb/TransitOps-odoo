const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Roles
  const roles = [
    { name: 'Admin', description: 'System Administrator with full access.' },
    { name: 'Fleet Manager', description: 'Oversees fleet assets and maintenance.' },
    { name: 'Dispatcher', description: 'Creates and assigns trips.' },
    { name: 'Safety Officer', description: 'Ensures compliance and tracks licenses.' },
    { name: 'Financial Analyst', description: 'Reviews expenses and profitability.' },
  ];

  const createdRoles = [];
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles.push(r);
  }

  // 2. Users (5 Users)
  const usersData = [
    { email: 'admin@transitops.com', firstName: 'Meet', lastName: 'Admin', roleId: createdRoles[0].id },
    { email: 'fleet@transitops.com', firstName: 'Harsh', lastName: 'Fleet', roleId: createdRoles[1].id },
    { email: 'dispatch@transitops.com', firstName: 'Ayaan', lastName: 'Dispatcher', roleId: createdRoles[2].id },
    { email: 'safety@transitops.com', firstName: 'Dhruv', lastName: 'Safety', roleId: createdRoles[3].id },
    { email: 'finance@transitops.com', firstName: 'Ankit', lastName: 'Finance', roleId: createdRoles[4].id },
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  // 3. Vehicles (10 Vehicles)
  const vehiclesData = Array.from({ length: 10 }).map((_, i) => ({
    registrationNumber: `TRK-${1000 + i}`,
    name: `Fleet Truck ${i + 1}`,
    model: i % 2 === 0 ? 'Volvo FH16' : 'Scania R500',
    type: i % 3 === 0 ? 'REFRIGERATED' : 'FLATBED',
    maxLoadCapacity: 15000 + (i * 1000), // in kg
    odometer: 10000 + (i * 5000),
    acquisitionCost: 120000 - (i * 2000),
    status: 'AVAILABLE',
  }));

  const createdVehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { registrationNumber: v.registrationNumber },
      update: {},
      create: v,
    });
    createdVehicles.push(vehicle);
  }

  // 4. Drivers (8 Drivers)
  const driversData = Array.from({ length: 8 }).map((_, i) => ({
    name: `Driver ${i + 1}`,
    licenseNumber: `DL-9000${i}`,
    licenseCategory: 'CE',
    licenseExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), // 2 years from now
    contactNumber: `+1-555-010${i}`,
    safetyScore: 95.0 + (i % 5),
    status: 'AVAILABLE',
  }));

  const createdDrivers = [];
  for (const d of driversData) {
    const driver = await prisma.driver.upsert({
      where: { licenseNumber: d.licenseNumber },
      update: {},
      create: d,
    });
    createdDrivers.push(driver);
  }

  // 5. Trips (20 Trips)
  const createdTrips = [];
  for (let i = 0; i < 20; i++) {
    const v = createdVehicles[i % 10];
    const d = createdDrivers[i % 8];
    const trip = await prisma.trip.create({
      data: {
        source: `City ${i}`,
        destination: `City ${i + 1}`,
        cargoWeight: v.maxLoadCapacity - 1000,
        plannedDistance: 150 + (i * 10),
        status: i < 5 ? 'COMPLETED' : 'DRAFT',
        vehicleId: v.id,
        driverId: d.id,
      },
    });
    createdTrips.push(trip);
  }

  // 6. Maintenance (5 Maintenance)
  for (let i = 0; i < 5; i++) {
    await prisma.maintenance.create({
      data: {
        description: `Routine Oil Change & Inspection ${i}`,
        cost: 250.0 + (i * 20),
        startDate: new Date(),
        status: 'CLOSED',
        vehicleId: createdVehicles[i].id,
      },
    });
  }

  // 7. Fuel Logs (20 Fuel Logs)
  for (let i = 0; i < 20; i++) {
    await prisma.fuelLog.create({
      data: {
        liters: 100 + (i * 5),
        cost: 150.0 + (i * 7),
        vehicleId: createdVehicles[i % 10].id,
      },
    });
  }

  // 8. Expenses (15 Expenses)
  for (let i = 0; i < 15; i++) {
    await prisma.expense.create({
      data: {
        type: i % 2 === 0 ? 'TOLL' : 'PARKING',
        amount: 25.0 + (i * 2),
        description: `En route expenses ${i}`,
        vehicleId: createdVehicles[i % 10].id,
        tripId: createdTrips[i % 20].id,
      },
    });
  }

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

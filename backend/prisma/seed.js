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
    fuelType: 'DIESEL',
    fuelTankCapacity: 300,
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
    email: `driver${i + 1}@transitops.com`,
    address: `${100 + i} Logistics Way, Transit City`,
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
  const adminId = usersData[0] ? (await prisma.user.findUnique({ where: { email: usersData[0].email } })).id : null;
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  for (let i = 0; i < 20; i++) {
    const v = createdVehicles[i % 10];
    const d = createdDrivers[i % 8];
    const trip = await prisma.trip.create({
      data: {
        tripNumber: `TRP-${todayStr}-${String(i + 1).padStart(4, '0')}`,
        source: `City ${i}`,
        destination: `City ${i + 1}`,
        cargoWeight: v.maxLoadCapacity - 1000,
        plannedDistance: 150 + (i * 10),
        status: i < 5 ? 'COMPLETED' : 'DRAFT',
        priority: i % 4 === 0 ? 'HIGH' : 'NORMAL',
        plannedStartTime: new Date(),
        plannedEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
        createdByUserId: adminId,
        vehicleId: v.id,
        driverId: d.id,
      },
    });
    createdTrips.push(trip);
  }

  // 6. Maintenance (5 Maintenance)
  for (let i = 0; i < 5; i++) {
    const v = createdVehicles[i];
    await prisma.maintenance.create({
      data: {
        maintenanceNumber: `MNT-${todayStr}-${String(i + 1).padStart(4, '0')}`,
        maintenanceType: i % 2 === 0 ? 'PREVENTIVE' : 'CORRECTIVE',
        priority: i % 3 === 0 ? 'HIGH' : 'NORMAL',
        description: `Routine Oil Change & Inspection ${i}`,
        estimatedCost: 200.0,
        actualCost: 250.0 + (i * 20),
        serviceDate: new Date(),
        nextServiceDate: new Date(new Date().setDate(new Date().getDate() + 90)),
        currentOdometer: v.odometer,
        status: i < 3 ? 'COMPLETED' : 'REQUESTED',
        vehicleId: v.id,
        reportedByUserId: adminId,
        completedByUserId: i < 3 ? adminId : null,
      },
    });
  }

  // 7. Fuel Logs (20 Fuel Logs)
  for (let i = 0; i < 20; i++) {
    const v = createdVehicles[i % 10];
    const liters = 100 + (i * 5);
    const pricePerLiter = 1.5;
    await prisma.fuelLog.create({
      data: {
        fuelLogNumber: `FUEL-${todayStr}-${String(i + 1).padStart(4, '0')}`,
        status: i % 2 === 0 ? 'APPROVED' : 'SUBMITTED',
        fuelType: 'DIESEL',
        fuelStation: 'Shell Station 1',
        paymentMethod: 'CORPORATE_CARD',
        pricePerLiter,
        totalCost: liters * pricePerLiter,
        liters,
        odometer: v.odometer + i * 100,
        filledAt: new Date(),
        vehicleId: v.id,
        tripId: createdTrips[i % 20]?.id,
        driverId: createdTrips[i % 20]?.driverId,
        createdByUserId: adminId,
        approvedByUserId: i % 2 === 0 ? adminId : null,
        approvedAt: i % 2 === 0 ? new Date() : null,
      },
    });
  }

  // 8. Expenses (15 Expenses)
  for (let i = 0; i < 15; i++) {
    await prisma.expense.create({
      data: {
        expenseNumber: `EXP-${todayStr}-${String(i + 1).padStart(4, '0')}`,
        type: i % 2 === 0 ? 'TOLL' : 'PARKING',
        amount: 25.0 + (i * 2),
        description: `En route expenses ${i}`,
        vehicleId: createdVehicles[i % 10].id,
        tripId: createdTrips[i % 20].id,
        createdByUserId: adminId,
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

const settingService = require('../src/services/setting.service');

async function seed() {
  console.log('Seeding default settings...');
  await settingService.seedDefaultSettings();
  console.log('Seed complete.');
  process.exit(0);
}

seed();

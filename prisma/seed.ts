import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample monitoring stations
  const station1 = await prisma.monitoringStation.upsert({
    where: { stationCode: 'DL_Anand_Vihar' },
    update: {},
    create: {
      stationCode: 'DL_Anand_Vihar',
      name: 'Delhi - Anand Vihar',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.6469,
      longitude: 77.2958,
      provider: 'CPCB',
      isActive: true,
    },
  });

  const station2 = await prisma.monitoringStation.upsert({
    where: { stationCode: 'DL_RK_Puram' },
    update: {},
    create: {
      stationCode: 'DL_RK_Puram',
      name: 'Delhi - RK Puram',
      city: 'Delhi',
      state: 'Delhi',
      latitude: 28.5631,
      longitude: 77.1717,
      provider: 'CPCB',
      isActive: true,
    },
  });

  const station3 = await prisma.monitoringStation.upsert({
    where: { stationCode: 'MH_Mumbai_Colaba' },
    update: {},
    create: {
      stationCode: 'MH_Mumbai_Colaba',
      name: 'Mumbai - Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 18.9067,
      longitude: 72.8147,
      provider: 'CPCB',
      isActive: true,
    },
  });

  console.log('✅ Created monitoring stations:', {
    station1: station1.name,
    station2: station2.name,
    station3: station3.name,
  });

  // Add sample observations (optional)
  const sampleObservation = await prisma.pollutantObservation.create({
    data: {
      stationId: station1.id,
      pollutantType: 'PM2_5',
      concentration: 142.5,
      unit: 'µg/m³',
      averagingPeriod: '24h',
      observedAt: new Date(),
      dataQualityFlag: 'VALID',
      sourceProvider: 'CPCB',
    },
  });

  console.log('✅ Created sample observation:', sampleObservation.id);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from './src/generated/prisma';

async function check() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Car'
    `;
    console.log('Columns in Car table:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error checking columns:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();

import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    // Run one read query to verify connection
    const user = await prisma.user.findFirst();
    console.log('✅ Connected');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

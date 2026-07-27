import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const email = 'olusanyamark1st@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User found:', user);
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

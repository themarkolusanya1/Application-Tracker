import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
  try {
    const passwordHash = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        name: 'Test Mark',
        email: 'testmark1st@gmail.com',
        password: passwordHash,
        role: 'STUDENT',
      },
    });
    console.log('✅ Created user:', user);
    
    // Clean up the test user
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ Cleaned up test user');
  } catch (error) {
    console.error('❌ Create failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

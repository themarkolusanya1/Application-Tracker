import { register } from '../src/app/actions/auth';

async function main() {
  try {
    const formData = new FormData();
    formData.append('name', 'New Test User');
    // Use a unique random email
    const uniqueEmail = `newuser_${Date.now()}@example.com`;
    formData.append('email', uniqueEmail);
    formData.append('password', 'password123');
    formData.append('role', 'STUDENT');

    console.log(`🚀 Calling register action for ${uniqueEmail}...`);
    const result = await register(formData);
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Action failed with unhandled error:', error);
  }
}

main();

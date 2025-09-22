const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:password@localhost:5200/waflpos?schema=public'
    }
  }
});

async function updateUsers() {
  console.log('🔄 Updating user passwords with 4-digit PINs...');

  try {
    // Update owner user (PIN: 1234)
    const hashedPin1234 = await bcrypt.hash('1234', 10);
    await prisma.user.updateMany({
      where: {
        userPin: 1234,
        role: 'owner'
      },
      data: {
        password: hashedPin1234
      }
    });
    console.log('✅ Updated owner user (PIN: 1234)');

    // Update staff user (PIN: 5678)
    const hashedPin5678 = await bcrypt.hash('5678', 10);
    await prisma.user.updateMany({
      where: {
        userPin: 5678,
        role: 'staff'
      },
      data: {
        password: hashedPin5678
      }
    });
    console.log('✅ Updated staff user (PIN: 5678)');

    console.log('🎉 All users updated successfully!');
    console.log('📝 Test credentials:');
    console.log('   - Store Code: 100001');
    console.log('   - Owner PIN: 1234, Password: 1234');
    console.log('   - Staff PIN: 5678, Password: 5678');

  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsers();
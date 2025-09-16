import { prisma } from './src';

async function test() {
  try {
    // 연결 테스트
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // 데이터 조회 테스트
    const storeCount = await prisma.store.count();
    console.log(`📊 Total stores: ${storeCount}`);

    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}`);

    const menuCount = await prisma.menu.count();
    console.log(`🍽️ Total menus: ${menuCount}`);

    const tableCount = await prisma.table.count();
    console.log(`🪑 Total tables: ${tableCount}`);

    const categoryCount = await prisma.category.count();
    console.log(`📋 Total categories: ${categoryCount}`);

    console.log('\n🎯 Database is ready for use!');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
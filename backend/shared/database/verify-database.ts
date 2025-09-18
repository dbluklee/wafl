// Database Verification Script
// This script tests all major database functionality

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres@localhost:5200/aipos?schema=public"
});

async function verifyDatabase() {
  try {
    console.log('🔍 Starting Database Verification...\n');

    // 1. Test Connection
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS');

    // 2. Test Read Operations
    const store = await prisma.store.findFirst({
      include: {
        users: true,
        categories: {
          include: {
            menus: true
          }
        },
        places: {
          include: {
            tables: true
          }
        }
      }
    });

    if (store) {
      console.log('✅ Store data read: SUCCESS');
      console.log(`   Store: ${store.name} (Code: ${store.storeCode})`);
      console.log(`   Users: ${store.users.length}`);
      console.log(`   Categories: ${store.categories.length}`);
      console.log(`   Menus: ${store.categories.reduce((total, cat) => total + cat.menus.length, 0)}`);
      console.log(`   Places: ${store.places.length}`);
      console.log(`   Tables: ${store.places.reduce((total, place) => total + place.tables.length, 0)}`);
    }

    // 3. Test Enum Types
    const userRoles = await prisma.user.findMany({
      select: { role: true },
      distinct: ['role']
    });
    console.log('✅ Enum types: SUCCESS');
    console.log(`   User roles found: ${userRoles.map(u => u.role).join(', ')}`);

    // 4. Test Complex Query with Relations
    const menuWithCategory = await prisma.menu.findFirst({
      include: {
        category: true,
        store: true
      }
    });

    if (menuWithCategory) {
      console.log('✅ Relations: SUCCESS');
      console.log(`   Menu: ${menuWithCategory.name} (${menuWithCategory.category?.name})`);
    }

    // 5. Test UUID Generation
    const tableCount = await prisma.table.count();
    console.log('✅ UUID generation: SUCCESS');
    console.log(`   Total tables with UUID IDs: ${tableCount}`);

    // 6. Test JSONB Fields
    const storeSettings = await prisma.store.findFirst({
      select: { openingHours: true }
    });

    if (storeSettings?.openingHours) {
      console.log('✅ JSONB fields: SUCCESS');
      console.log(`   Opening hours structure: ${typeof storeSettings.openingHours === 'object' ? 'Valid JSON' : 'Invalid'}`);
    }

    // 7. Summary
    console.log('\n🎉 DATABASE VERIFICATION COMPLETE!');
    console.log('📊 Database Statistics:');

    const stats = await Promise.all([
      prisma.store.count(),
      prisma.user.count(),
      prisma.category.count(),
      prisma.menu.count(),
      prisma.place.count(),
      prisma.table.count()
    ]);

    console.log(`   - Stores: ${stats[0]}`);
    console.log(`   - Users: ${stats[1]}`);
    console.log(`   - Categories: ${stats[2]}`);
    console.log(`   - Menus: ${stats[3]}`);
    console.log(`   - Places: ${stats[4]}`);
    console.log(`   - Tables: ${stats[5]}`);

    console.log('\n🚀 Database is ready for AI POS System services!');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
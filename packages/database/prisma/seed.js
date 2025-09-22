"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // 1. Demo Store 생성
    const store = await prisma.store.create({
        data: {
            storeCode: 1001,
            name: 'Demo Restaurant',
            businessNumber: '123-45-67890',
            email: 'demo@restaurant.com',
            phone: '02-1234-5678',
            address: '서울시 강남구 테헤란로 123',
            subscriptionStatus: 'active',
            openingHours: {
                mon: { open: '10:00', close: '22:00' },
                tue: { open: '10:00', close: '22:00' },
                wed: { open: '10:00', close: '22:00' },
                thu: { open: '10:00', close: '22:00' },
                fri: { open: '10:00', close: '23:00' },
                sat: { open: '10:00', close: '23:00' },
                sun: { open: '11:00', close: '21:00' }
            }
        }
    });
    // 2. 테스트 점주 계정 생성
    const owner = await prisma.user.create({
        data: {
            storeId: store.id,
            name: '김점주',
            phone: '010-1234-5678',
            userPin: '1234',
            password: await bcrypt.hash('password123', 10),
            role: 'owner',
            isMobileVerified: true
        }
    });
    // 3. 테스트 직원 계정 생성
    const staff = await prisma.user.create({
        data: {
            storeId: store.id,
            name: '이직원',
            phone: '010-5678-1234',
            userPin: '5678',
            password: await bcrypt.hash('password123', 10),
            role: 'staff',
            isMobileVerified: true
        }
    });
    // 4. 카테고리 생성
    const categories = await prisma.category.createMany({
        data: [
            { storeId: store.id, name: '메인 요리', color: '#FF5733', sortOrder: 1 },
            { storeId: store.id, name: '사이드', color: '#33FF57', sortOrder: 2 },
            { storeId: store.id, name: '음료', color: '#3357FF', sortOrder: 3 },
            { storeId: store.id, name: '디저트', color: '#FF33F5', sortOrder: 4 },
            { storeId: store.id, name: '주류', color: '#F5FF33', sortOrder: 5 }
        ]
    });
    // 카테고리 ID 조회
    const categoryList = await prisma.category.findMany({
        where: { storeId: store.id }
    });
    // 5. 메뉴 생성 (각 카테고리별 6개씩)
    const menuData = [
        // 메인 요리
        { name: '김치찌개', price: 8000, categoryName: '메인 요리', tags: ['spicy', 'popular'], prepTime: 15 },
        { name: '된장찌개', price: 8000, categoryName: '메인 요리', tags: ['healthy'], prepTime: 15 },
        { name: '불고기', price: 15000, categoryName: '메인 요리', tags: ['signature'], prepTime: 20 },
        { name: '비빔밥', price: 10000, categoryName: '메인 요리', tags: ['vegetarian'], prepTime: 10 },
        { name: '삼겹살', price: 14000, categoryName: '메인 요리', tags: ['popular'], prepTime: 15 },
        { name: '냉면', price: 11000, categoryName: '메인 요리', tags: ['summer'], prepTime: 5 },
        // 사이드
        { name: '김치', price: 3000, categoryName: '사이드', tags: ['spicy'], prepTime: 0 },
        { name: '계란찜', price: 5000, categoryName: '사이드', tags: ['popular'], prepTime: 10 },
        { name: '파전', price: 12000, categoryName: '사이드', tags: ['sharing'], prepTime: 15 },
        { name: '감자전', price: 10000, categoryName: '사이드', tags: [], prepTime: 15 },
        { name: '두부김치', price: 8000, categoryName: '사이드', tags: ['spicy'], prepTime: 10 },
        { name: '잡채', price: 7000, categoryName: '사이드', tags: ['vegetarian'], prepTime: 10 },
        // 음료
        { name: '콜라', price: 3000, categoryName: '음료', tags: [], prepTime: 0 },
        { name: '사이다', price: 3000, categoryName: '음료', tags: [], prepTime: 0 },
        { name: '오렌지주스', price: 4000, categoryName: '음료', tags: [], prepTime: 0 },
        { name: '아이스티', price: 3500, categoryName: '음료', tags: [], prepTime: 0 },
        { name: '커피', price: 3000, categoryName: '음료', tags: ['hot'], prepTime: 3 },
        { name: '녹차', price: 3000, categoryName: '음료', tags: ['hot'], prepTime: 3 },
        // 디저트
        { name: '아이스크림', price: 3000, categoryName: '디저트', tags: ['cold'], prepTime: 0 },
        { name: '팥빙수', price: 8000, categoryName: '디저트', tags: ['summer', 'sharing'], prepTime: 5 },
        { name: '호떡', price: 3000, categoryName: '디저트', tags: ['sweet'], prepTime: 5 },
        { name: '찹쌀떡', price: 4000, categoryName: '디저트', tags: ['traditional'], prepTime: 0 },
        { name: '티라미수', price: 6000, categoryName: '디저트', tags: ['popular'], prepTime: 0 },
        { name: '치즈케이크', price: 6500, categoryName: '디저트', tags: [], prepTime: 0 },
        // 주류
        { name: '소주', price: 5000, categoryName: '주류', tags: ['alcohol'], prepTime: 0 },
        { name: '맥주', price: 5000, categoryName: '주류', tags: ['alcohol'], prepTime: 0 },
        { name: '막걸리', price: 6000, categoryName: '주류', tags: ['alcohol', 'traditional'], prepTime: 0 },
        { name: '청하', price: 7000, categoryName: '주류', tags: ['alcohol'], prepTime: 0 },
        { name: '와인', price: 35000, categoryName: '주류', tags: ['alcohol', 'premium'], prepTime: 0 },
        { name: '위스키', price: 15000, categoryName: '주류', tags: ['alcohol', 'premium'], prepTime: 0 }
    ];
    for (const menu of menuData) {
        const category = categoryList.find(c => c.name === menu.categoryName);
        if (category) {
            await prisma.menu.create({
                data: {
                    storeId: store.id,
                    categoryId: category.id,
                    name: menu.name,
                    price: menu.price,
                    description: `${menu.name}입니다. 맛있게 드세요!`,
                    tags: menu.tags,
                    allergens: [],
                    isAvailable: true,
                    stockQuantity: 100,
                    prepTime: menu.prepTime,
                    calories: Math.floor(Math.random() * 500) + 200
                }
            });
        }
    }
    // 6. 장소 생성
    const places = await Promise.all([
        prisma.place.create({
            data: {
                storeId: store.id,
                name: '1st Floor',
                color: '#28a745'
            }
        }),
        prisma.place.create({
            data: {
                storeId: store.id,
                name: '2nd Floor',
                color: '#007bff'
            }
        }),
        prisma.place.create({
            data: {
                storeId: store.id,
                name: 'Terrace',
                color: '#ffc107'
            }
        })
    ]);
    // 7. 테이블 생성 (각 장소별로 분배)
    let tableNumber = 1;
    for (const place of places) {
        const tableCount = place.name === 'Terrace' ? 5 : 8;
        for (let i = 0; i < tableCount; i++) {
            await prisma.table.create({
                data: {
                    storeId: store.id,
                    placeId: place.id,
                    name: `Table ${tableNumber}`,
                    qrCode: `QR_TABLE_${tableNumber.toString().padStart(2, '0')}`,
                    capacity: Math.random() > 0.5 ? 4 : 6,
                    status: 'empty'
                }
            });
            tableNumber++;
        }
    }
    console.log('✅ Seeding completed successfully!');
    console.log('📊 Created:');
    console.log('   - 1 Store (code: 1001)');
    console.log('   - 2 Users (PIN: 1234, 5678)');
    console.log('   - 5 Categories');
    console.log('   - 30 Menus');
    console.log('   - 3 Places');
    console.log('   - 21 Tables');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});

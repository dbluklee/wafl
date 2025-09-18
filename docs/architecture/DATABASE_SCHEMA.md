# AI POS System 데이터베이스 스키마

## 📊 전체 데이터베이스 구조

**데이터베이스**: aipos
**DBMS**: PostgreSQL 15 + UUID Extension
**ORM**: Prisma
**Connection**: postgresql://postgres:Cl!Wm@Dp!Dl@Em!@localhost:5200/aipos
**Version**: 1.0.0

### 📈 통계
- **테이블 수**: 16개 (핵심 12개 + 기능 4개)
- **Enum 타입**: 7개
- **인덱스**: 성능 최적화를 위한 25개 인덱스
- **트리거**: 9개 updated_at 자동 업데이트
- **확장 기능**: Redis 캐시, 파티셔닝, Row Level Security

## 🗃️ 테이블 목록

### 핵심 테이블 (Core Tables)
1. **stores** - 매장 정보 및 구독 상태
2. **users** - 사용자 (점주/직원) + 듀얼 로그인 시스템
3. **customers** - QR 주문 고객 세션
4. **categories** - 메뉴 카테고리 (색상, 정렬 포함)
5. **menus** - 메뉴 아이템 (다국어 지원, 태그, 알레르기 정보)
6. **places** - 장소/층 (홀, 테라스 등)
7. **tables** - 테이블 정보 + QR 코드
8. **orders** - 주문 정보 (AI 인터랙션 추적)
9. **order_items** - 주문 아이템 (옵션, 메모)
10. **payments** - 결제 정보 (실물카드 결제 지원)

### 기능 테이블 (Feature Tables)
11. **history_logs** - Undo 기능용 히스토리
12. **ai_conversations** - AI 대화 기록
13. **analytics_daily** - 일일 분석 데이터
14. **sms_verifications** - SMS 인증

### 기존 Prisma 호환 테이블 (Legacy Support)
15. **sessions** - 세션 관리 (Prisma 기존 구현)
16. **pos_logs** - POS 로그 (Prisma 기존 구현)

## 📋 DDL (Data Definition Language)

### Enum 타입 정의

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 역할
CREATE TYPE user_role AS ENUM ('owner', 'staff');

-- 매장 구독 상태
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'suspended');

-- 테이블 상태
CREATE TYPE table_status AS ENUM ('empty', 'seated', 'ordered');

-- 주문 상태
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'cooking',
    'ready',
    'served',
    'cancelled'
);

-- 결제 방법
CREATE TYPE payment_method AS ENUM ('mobile', 'card', 'cash');

-- 결제 상태
CREATE TYPE payment_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);

-- AI 대화 타입
CREATE TYPE ai_conversation_type AS ENUM ('customer', 'owner');
```

### 핵심 테이블 정의 (Core Tables)

#### 1. stores (매장)
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_code INTEGER UNIQUE NOT NULL, -- 로그인용 매장 코드
    name VARCHAR(200) NOT NULL,
    business_number VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    opening_hours JSONB, -- {"mon": {"open": "09:00", "close": "22:00"}, ...}
    settings JSONB, -- 매장별 설정값
    scraping_url VARCHAR(500), -- 네이버 플레이스 URL
    subscription_status subscription_status DEFAULT 'trial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. users (사용자 - 점주/직원)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    phone VARCHAR(20) UNIQUE, -- 모바일 인증용
    user_pin VARCHAR(4), -- PIN 로그인용 (4자리)
    password VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_mobile_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    last_login_at TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE (store_id, user_pin) -- 매장 내 PIN 중복 방지
);
```

#### 3. customers (고객)
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    language VARCHAR(5) DEFAULT 'ko', -- 고객 선호 언어
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. categories (카테고리)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7), -- HEX color code
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

#### 5. menus (메뉴)
```sql
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    category_id UUID,
    name VARCHAR(200) NOT NULL, -- 한국어로 저장, LLM이 번역
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    tags TEXT[], -- ARRAY['spicy', 'popular', 'new']
    allergens TEXT[], -- ARRAY['peanut', 'milk', 'egg']
    is_available BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER,
    prep_time INTEGER, -- minutes
    calories INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

#### 6. places (장소)
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL, -- '1st Floor', 'Terrace', etc.
    color VARCHAR(7), -- HEX color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

#### 7. tables (테이블)
```sql
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    place_id UUID,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL, -- 'Table 1', 'Table A', etc.
    capacity INTEGER,
    status table_status DEFAULT 'empty',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
);
```

#### 8. orders (주문)
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    table_id UUID NOT NULL,
    customer_id UUID, -- QR 주문시 고객 세션
    order_number VARCHAR(20) UNIQUE NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) DEFAULT 0,
    special_requests TEXT,
    customer_language VARCHAR(5) DEFAULT 'ko',
    ai_interaction BOOLEAN DEFAULT FALSE, -- AI 챗 사용 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);
```

#### 9. order_items (주문 항목)
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    menu_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    options JSONB, -- {"size": "large", "spice": "mild"}
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id)
);
```

#### 10. payments (결제)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    method payment_method NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending',
    pg_response JSONB, -- PG사 응답 전체
    card_reader_id VARCHAR(50), -- 실물카드 결제시 리더기 ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### 기능 테이블 정의 (Feature Tables)

#### 11. history_logs (히스토리 로그 - Undo 기능)
```sql
CREATE TABLE history_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    store_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
    entity_type VARCHAR(50) NOT NULL, -- 'menu', 'table', 'category', etc.
    entity_id UUID NOT NULL,
    old_data JSONB, -- 이전 상태
    new_data JSONB, -- 새로운 상태
    is_undoable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    undo_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);
```

#### 12. ai_conversations (AI 대화 기록)
```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    user_id UUID, -- 점주 대화시
    customer_id UUID, -- 고객 대화시
    order_id UUID, -- 주문 관련 대화시
    session_id VARCHAR(100) NOT NULL,
    type ai_conversation_type NOT NULL,
    messages JSONB[], -- Array of {role, content, timestamp}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);
```

#### 13. analytics_daily (일일 분석)
```sql
CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL,
    date DATE NOT NULL,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    avg_order_value DECIMAL(10, 2) DEFAULT 0,
    menu_performance JSONB, -- {"menu_id": {"quantity": 10, "revenue": 100000}}
    hourly_sales JSONB, -- {"09": 50000, "10": 80000, ...}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE (store_id, date)
);
```

#### 14. sms_verifications (SMS 인증)
```sql
CREATE TABLE sms_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prisma 호환 테이블 (Legacy Support)

## 🔗 인덱스 (Performance Indexes)

```sql
-- 사용자 테이블 인덱스
CREATE INDEX idx_users_store_id ON users(store_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_store_pin ON users(store_id, user_pin);

-- 메뉴 관련 인덱스
CREATE INDEX idx_categories_store_id ON categories(store_id);
CREATE INDEX idx_menus_store_id ON menus(store_id);
CREATE INDEX idx_menus_category_id ON menus(category_id);

-- 장소 및 테이블 인덱스
CREATE INDEX idx_places_store_id ON places(store_id);
CREATE INDEX idx_tables_store_id ON tables(store_id);
CREATE INDEX idx_tables_place_id ON tables(place_id);
CREATE INDEX idx_tables_qr_code ON tables(qr_code);

-- 주문 관련 인덱스
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_store_date ON orders(store_id, created_at);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_id ON order_items(menu_id);

-- 결제 인덱스
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- 기능 테이블 인덱스
CREATE INDEX idx_history_logs_store_id ON history_logs(store_id);
CREATE INDEX idx_history_logs_user_id ON history_logs(user_id);
CREATE INDEX idx_history_logs_entity ON history_logs(entity_type, entity_id);

CREATE INDEX idx_ai_conversations_store_id ON ai_conversations(store_id);
CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);

CREATE INDEX idx_analytics_daily_store_date ON analytics_daily(store_id, date);

CREATE INDEX idx_sms_verifications_phone ON sms_verifications(phone);
CREATE INDEX idx_sms_verifications_expires ON sms_verifications(expires_at);
```

## ⚡ 트리거 (Triggers)

### Updated_at 자동 업데이트
```sql
-- Updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_daily_updated_at BEFORE UPDATE ON analytics_daily
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📊 Redis 캐시 구조

### Redis 데이터 구조 설명
```
1. 세션 (Sessions)
   Key: session:{token}
   Type: Hash
   TTL: 86400 (24시간)
   Fields:
     - user_id: UUID
     - store_id: UUID
     - role: STRING
     - permissions: JSON
     - expires_at: TIMESTAMP

2. 테이블 상태 (Real-time)
   Key: table:{table_id}
   Type: Hash
   TTL: 43200 (12시간)
   Fields:
     - status: STRING
     - seated_at: TIMESTAMP
     - current_order_id: UUID
     - number_of_people: INTEGER
     - staying_time: INTEGER

3. 메뉴 캐시
   Key: menu:{store_id}
   Type: Hash
   TTL: 3600 (1시간)
   Fields:
     - categories: JSON
     - items: JSON
     - popular_items: JSON
     - last_updated: TIMESTAMP

4. 주문 대기열 (Kitchen)
   Key: order_queue:{store_id}
   Type: List
   Structure: Order IDs in FIFO

5. WebSocket 연결
   Key: ws:{store_id}:{client_id}
   Type: String
   Value: Connection metadata
```

## 🎯 User Profile Service 관련 테이블

### 핵심 테이블
User Profile Service(포트 4009)에서 주로 사용하는 테이블들:

#### users 테이블 (사용자 정보)
```sql
-- User Profile Service에서 사용하는 주요 컬럼
SELECT
    id,              -- 사용자 ID (UUID)
    store_id,        -- 소속 매장 ID
    name,            -- 사용자 이름 (수정 가능)
    phone,           -- 전화번호 (선택사항)
    user_pin,        -- PIN (변경 가능, 4자리)
    role,            -- 역할 (owner/staff)
    is_mobile_verified, -- 모바일 인증 여부
    last_login_at,   -- 마지막 로그인
    created_at,      -- 생성일
    deleted_at       -- 소프트 삭제 (직원 비활성화)
FROM users;
```

#### stores 테이블 (매장 정보)
```sql
-- 매장 기본 정보 조회용
SELECT
    id,              -- 매장 ID (UUID)
    store_code,      -- 매장 코드 (로그인용)
    name,            -- 매장명
    phone,           -- 매장 전화번호
    address          -- 매장 주소
FROM stores;
```

### User Profile Service API와 테이블 매핑

1. **프로필 조회/수정**
   - 테이블: `users`, `stores`
   - 주요 컬럼: `name`, `phone`, `role`, `last_login_at`

2. **PIN 변경**
   - 테이블: `users`
   - 주요 컬럼: `user_pin`

3. **직원 관리 (점주 전용)**
   - 테이블: `users` (role='staff')
   - 작업: CREATE, UPDATE, 소프트 DELETE (`deleted_at`)

4. **언어 설정**
   - 현재: 로그만 기록 (DB 저장 안함)
   - 향후: `users` 테이블에 `preferred_language` 컬럼 추가 예정

## 🔒 보안 및 권한

### Row Level Security (향후 구현 예정)
```sql
-- 예시: 매장별 데이터 격리
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY orders_store_policy ON orders
--     FOR ALL
--     USING (store_id = current_setting('app.current_store_id')::UUID);
```

### 데이터 보안 고려사항
- **PIN 저장**: 현재 평문 저장 (향후 해싱 고려)
- **전화번호**: 고유 제약 조건 적용
- **소프트 삭제**: `deleted_at` 컬럼으로 데이터 복구 가능
- **매장별 격리**: `store_id`로 데이터 분리

## 🔧 유지보수 및 최적화

### 정기 유지보수 작업
```sql
-- 만료된 SMS 인증 정리 (주기적 실행)
DELETE FROM sms_verifications WHERE expires_at < CURRENT_TIMESTAMP;

-- 오래된 히스토리 로그 아카이브 (월 단위)
-- INSERT INTO history_logs_archive
-- SELECT * FROM history_logs
-- WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '3 months';
```

### 파티셔닝 (대용량 처리시)
```sql
-- 주문 테이블 월별 파티셔닝 (필요시 활성화)
-- CREATE TABLE orders_2024_01 PARTITION OF orders
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

## 📝 초기 데이터

### 개발용 샘플 데이터
```sql
-- 샘플 매장 (개발용)
INSERT INTO stores (store_code, name, business_number, email, subscription_status)
VALUES (1001, 'Demo Restaurant', '123-45-67890', 'demo@restaurant.com', 'active');
```

## 📈 버전 히스토리

- **v1.0.0** - 초기 스키마
  - 듀얼 로그인 시스템 (Mobile/PIN)
  - 실물카드 결제 지원
  - Undo 기능을 위한 히스토리 로그
  - AI 대화 추적
  - LLM을 통한 다국어 지원

## 🚀 향후 확장 계획

### User Profile Service 관련
- **users 테이블**: `preferred_language` 컬럼 추가
- **보안 강화**: PIN 해싱, 세밀한 권한 관리
- **프로필 이미지**: 이미지 업로드 기능 (선택적)

### 시스템 전반
- **History Service**: 별도 서비스로 로깅 시스템 확장
- **AI Service**: AI 대화 기록 및 분석 강화
- **Analytics**: 실시간 분석 및 리포팅 확장

---

## 📋 요약

이 문서는 AI POS System의 완전한 데이터베이스 스키마를 제공합니다.

**주요 특징**:
- **16개 테이블**로 구성된 완전한 POS 시스템
- **듀얼 로그인** (Mobile + PIN) 지원
- **AI 대화 추적** 및 **Undo 기능**
- **실물카드 결제** 지원
- **User Profile Service** 전용 최적화

**개발 참조**:
- User Profile Service는 주로 `users`, `stores` 테이블 사용
- 포트 4009에서 8개 API 제공
- JWT 인증 및 역할 기반 접근 제어 적용

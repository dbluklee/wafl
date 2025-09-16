# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
BurnanaPOS is a Restaurant POS application focused on place/table configuration and real-time order status monitoring. This is an MVP implementation with specific scope limitations.

## Key Development Commands

### Development
- `npm run dev` - Start both frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run dev:tablet` - Start frontend in tablet mode with host access (frontend directory)

### Build & Production
- `npm run build` - Build both frontend and backend
- `npm run build:frontend` - Build frontend only  
- `npm run build:backend` - Build backend only
- `npm start` - Start production backend server

### Code Quality
- `npm run lint` - Run ESLint on frontend code (in frontend directory)
- `npm run build-check` - TypeScript check and build frontend (in frontend directory)

## Architecture & Implementation Guidelines

### Frontend (React + TypeScript + Vite)
- **State Management**: 
  - Zustand for local UI state
  - React Query for server data caching and synchronization
  - IndexedDB for persistent local storage

- **API Communication**: Axios for centralized API call management
- **Styling**: Tailwind CSS v4 with custom color system in `colors.css`
- **Responsive**: Optimized for tablet screens with fullscreen support

### Backend (Node.js + Express + TypeScript)
- **Database**: SQLite for development, PostgreSQL ready for production
- **API Endpoints**:
  - `GET/POST /api/places` - Place management
  - `PUT/DELETE /api/places/:id` - Place updates
  - `GET/POST /api/tables` - Table management
  - `PUT/DELETE /api/tables/:id` - Table updates
  - `GET/POST /api/logs` - Activity logging
  - `POST /api/logs/:id/undo` - Undo actions
  - `GET /api/orders` - Dummy order data

## MVP Development Phases & Priorities

### Phase 1: Figma UI Full Replication ✅
- Welcome Page - 100% match to Figma design
- Authentication Page - Dummy implementation (no real phone auth)
- Main Homepage - Bento grid with only Management/Dashboard active

### Phase 2: Management Features (Current Focus)
- **Place Management**:
  - Add Place: "+" button → Panel with name input and 8-color palette
  - Place Card: Inner shadow selection effect, display table count
  - Delete Place: Two-step confirmation with swipe UI
  
- **Table Management**:
  - Add Table: Name input with place dropdown selection
  - Table Card: Grey cards linked to place colors
  
- **POS Log System**:
  - Log card design matching Figma
  - Right-side slide Undo function
  - Time display and action format

### Phase 3: Dashboard Implementation
- Floor buttons per place (linked with Management)
- Table card grid with Figma layout
- Empty tables: Grey cards with place/table names
- Order tables: Colored cards with dummy data (PlaceName, TableName, NumberOfPeople, StayingTime, menu list, TotalQty, TotalPrice)

## Critical Implementation Requirements

### UI/UX Requirements
- **Figma Compliance**: MUST use Figma MCP server to implement 100% identical designs
- **Exact Replication Required**:
  - Colors, typography, spacing must match exactly
  - Animation effects (inner shadow, slide, etc.)
  - All buttons, input fields, cards identical to Figma
  - Header format: Home button, page title, current time/date

### Functional Requirements
- **Dummy Implementations**:
  - Authentication: Press phone auth button → navigate to homepage (no real verification)
  - Sign Up: Collect info but use dummy phone authentication
  - Order Data: Use dummy data for dashboard display

- **Excluded Features** (UI-only, no functionality):
  - AI Agent blocks
  - Analytics blocks  
  - Category/Menu tabs
  - POS settings, FAQ, multilingual support
  - Naver menu scraping
  - QR order system linkage

### Development Constraints
- Component-based development for each page
- State synchronization between Management ↔ Dashboard
- Use local dummy data without external APIs
- Two-step deletion confirmation for all delete operations
- Complete action logging with undo capability

## Service Layer Architecture

### Frontend Services (`frontend/src/services/`)
- `database.ts` - IndexedDB operations
- `placeService.ts` - Place CRUD logic
- `tableService.ts` - Table CRUD logic
- `loggingService.ts` - Action logging and undo
- `syncService.ts` - Frontend-backend sync
- `userService.ts` - User state management

### Page Components (`frontend/src/pages/`)
- `WelcomePage.tsx` - Landing page
- `SignUpPage.tsx` - Business registration
- `SignInPage.tsx` - Dummy login
- `HomePage.tsx` - Bento grid navigation
- `ManagementPage.tsx` - Place/Table management

## Key Implementation Notes
1. Navigation uses custom page-based system without routing library
2. Page transitions include animation support with history tracking
3. Fullscreen mode support for tablet optimization
4. All forms use controlled components with React state
5. Error handling through centralized Axios interceptors
6. Responsive design primarily targets tablet screens
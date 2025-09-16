# BurnanaPOS 🍌

Restaurant POS App - Place/Table configuration and real-time order status monitoring

## Features

- **Place/Table Management**: Create and manage dining areas and tables
- **Real-time Dashboard**: Monitor order status and table availability
- **Figma-Matched UI**: Pixel-perfect implementation of Figma designs
- **Responsive Design**: Optimized for tablet screens

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Zustand for state management
- React Query for server state
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL (planned)
- RESTful API design

## Development Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start development servers:
```bash
npm run dev
```

This will start both frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

### Individual Services

Start frontend only:
```bash
npm run dev:frontend
```

Start backend only:
```bash
npm run dev:backend
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
burnanapos/
├── frontend/          # React + TypeScript frontend
├── backend/           # Node.js + Express backend
├── BurnanaPOSSpecification.md  # Project specification
└── README.md
```

## Development Phases

### Phase 1: UI Implementation ✅
- [x] Welcome Page
- [x] Authentication Page (dummy)
- [x] Main Homepage (Bento Grid)

### Phase 2: Management Features
- [ ] Place Management (CRUD)
- [ ] Table Management (CRUD)
- [ ] POS Log System

### Phase 3: Dashboard
- [ ] Real-time Table Status
- [ ] Order Monitoring (dummy data)
- [ ] Floor-based Navigation

## API Endpoints

### Places
- `GET /api/places` - Get all places
- `POST /api/places` - Create place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

### Tables
- `GET /api/tables` - Get all tables
- `POST /api/tables` - Create table
- `PUT /api/tables/:id` - Update table
- `DELETE /api/tables/:id` - Delete table

### Logs
- `GET /api/logs` - Get activity logs
- `POST /api/logs` - Create log entry
- `POST /api/logs/:id/undo` - Undo action

### Orders (Dummy Data)
- `GET /api/orders` - Get dummy order data

## License

ISC
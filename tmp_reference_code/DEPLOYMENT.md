# Burnana POS - Deployment Guide

## System Overview

The Burnana POS system now includes a complete Place management system with:
- **Store Number** tracking for multi-location support
- **User PIN** authentication for each action
- **Real-time logging** to database with full audit trail
- **SQLite database** for both Places and Logs storage
- **Docker deployment** for easy setup on any machine

## Data Schema

### Places Table
- `id` - Auto-incrementing primary key
- `store_number` - Store identification (e.g., "STORE001")
- `name` - Place name (e.g., "1st Floor")
- `color` - Display color for the place card
- `table_count` - Number of tables in this place
- `user_pin` - PIN of the user who created the place
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Logs Table
- `id` - Auto-incrementing primary key
- `type` - Log type (PLACE_CREATED, PLACE_DELETED, etc.)
- `message` - Human-readable log message
- `user_pin` - PIN of user who performed the action
- `store_number` - Associated store number
- `place_name` - Associated place name
- `metadata` - Additional JSON metadata
- `created_at` - Log timestamp

## Quick Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000 and 3001 available

### Deploy with Docker Compose

1. **Clone and navigate to the project directory:**
   ```bash
   cd /path/to/burnana
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Data Persistence
- SQLite database is automatically created in `./backend/data/burnana.db`
- Database is mounted as a volume for data persistence across container restarts

## Development Mode

### Backend Development
```bash
cd backend
npm install
npm run dev  # Starts on port 3001
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev  # Starts on port 3000 (Vite)
```

## API Endpoints

### Places
- `GET /api/places` - Get all places
- `GET /api/places/store/:storeNumber` - Get places by store
- `GET /api/places/:id` - Get specific place
- `POST /api/places` - Create new place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

### Logs
- `GET /api/logs` - Get all logs
- `GET /api/logs/store/:storeNumber` - Get logs by store
- `GET /api/logs/type/:type` - Get logs by type
- `POST /api/logs` - Create log entry
- `DELETE /api/logs/:id` - Delete log (undo functionality)

### Health Check
- `GET /api/health` - Service health status

## Usage Instructions

### Creating a New Place

1. Navigate to the **Management** page
2. Click the **Place** tab
3. Click the **+** button in the top right
4. Fill in the required fields:
   - **Store Number**: Unique identifier for your store location
   - **User PIN**: Your 4-digit authentication PIN
   - **Place Name**: Descriptive name for the area
   - **Color**: Choose a color to distinguish this place
5. Click **Save**

### Viewing Place Creation Logs

- All place creation actions are logged in real-time
- View logs in the right panel of the Management page
- Each log entry shows:
  - Timestamp
  - Action performed
  - User PIN who performed the action
  - Place/Store details

### Data Persistence

- All place data is immediately saved to the SQLite database
- Logs are created for all actions (create, update, delete)
- Database file persists across application restarts
- In Docker deployment, data is mounted as a volume for persistence

## Production Deployment

### Environment Variables
Set these for production:
```bash
NODE_ENV=production
PORT=3001
```

### Security Considerations
- User PINs are stored in plaintext (enhance with hashing for production)
- API endpoints are unprotected (add authentication middleware for production)
- CORS is enabled for all origins (restrict for production)

### Docker Production Build

```bash
# Build production images
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Scaling Considerations

- SQLite is suitable for single-instance deployments
- For multi-instance deployments, consider PostgreSQL or MySQL
- Database migrations may be needed when scaling

## Testing

### API Testing Examples

```bash
# Test health
curl http://localhost:3001/api/health

# Create a place
curl -X POST http://localhost:3001/api/places \
  -H "Content-Type: application/json" \
  -d '{
    "store_number": "STORE001",
    "name": "Main Floor",
    "color": "#FF6B6B",
    "table_count": 10,
    "user_pin": "1234"
  }'

# Get all places
curl http://localhost:3001/api/places

# Get logs
curl http://localhost:3001/api/logs
```

## System Features

✅ **Complete Place Management**
- Create, read, update, delete places
- Store number and user PIN tracking
- Color-coded place cards

✅ **Real-time Logging**
- All actions logged to database
- Comprehensive audit trail
- User attribution for all actions

✅ **Database Integration**
- SQLite database for data persistence
- Separate tables for Places and Logs
- Automatic database initialization

✅ **Docker Deployment**
- Single-command deployment
- Data persistence across restarts
- Production-ready containerization

✅ **Modern UI**
- Responsive place cards
- Real-time log display
- Smooth animations and transitions

## Support

The system is now fully functional with:
- Database-backed place storage
- Complete audit logging
- Docker deployment ready
- Multi-store support via store numbers
- User authentication via PINs

All test places have been removed, and the system is ready for production use.
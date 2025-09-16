import { createServer } from 'http';
import app from './app';
import { config } from './config';
import { createWebSocketManager } from './events/websocket';
import { cache } from './utils/cache';

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket manager
const wsManager = createWebSocketManager(httpServer);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  httpServer.close(async () => {
    console.log('HTTP server closed.');

    try {
      // Shutdown WebSocket manager
      await wsManager.shutdown();

      // Clear cache
      cache.destroy();

      // Exit process
      console.log('Graceful shutdown completed.');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = () => {
  httpServer.listen(config.port, () => {
    console.log(`
🚀 Dashboard Service Started Successfully!

📊 Service Information:
   Name: ${config.serviceName}
   Port: ${config.port}
   Environment: ${config.env}

🌐 Server Endpoints:
   HTTP: http://localhost:${config.port}
   Health Check: http://localhost:${config.port}/health
   API Base: http://localhost:${config.port}/api/v1/dashboard

🔌 WebSocket:
   Path: ${config.websocket.path}
   URL: ws://localhost:${config.port}${config.websocket.path}

📡 Available API Endpoints:

   Dashboard Overview:
   GET    /api/v1/dashboard/overview              # Complete dashboard overview
   GET    /api/v1/dashboard/summary               # Summary statistics only
   GET    /api/v1/dashboard/realtime/status       # Real-time status updates

   Table Management:
   PATCH  /api/v1/dashboard/tables/:id/status     # Update table status
   POST   /api/v1/dashboard/tables/:id/seat       # Seat customers at table
   POST   /api/v1/dashboard/tables/:id/clear      # Clear table
   GET    /api/v1/dashboard/tables/:id            # Get table details

   Place Management:
   GET    /api/v1/dashboard/places/:id/tables     # Get tables in a place

   Statistics:
   GET    /api/v1/dashboard/stats/today           # Today's statistics

   POS Logs:
   GET    /api/v1/dashboard/logs                  # Get logs (paginated)
   GET    /api/v1/dashboard/logs/recent           # Get recent logs
   GET    /api/v1/dashboard/logs/undoable         # Get undoable actions
   POST   /api/v1/dashboard/logs/undo             # Undo an action
   GET    /api/v1/dashboard/logs/actions/:action  # Get logs by action type
   GET    /api/v1/dashboard/logs/table/:tableId   # Get logs for a table
   GET    /api/v1/dashboard/logs/stats            # Log statistics

🔐 Authentication:
   All API endpoints require JWT authentication
   Header: Authorization: Bearer <token>

🎯 WebSocket Events:

   Client → Server:
   - join:store         # Join store room for updates
   - join:table         # Join table room for updates
   - join:dashboard     # Join dashboard room for updates
   - join:logs          # Join logs room for updates
   - ping               # Health check ping

   Server → Client:
   - dashboard:overview:updated    # Dashboard data updated
   - table:status:changed         # Table status changed
   - order:created               # New order created
   - order:status:updated        # Order status updated
   - log:created                # New log entry
   - stats:updated              # Statistics updated
   - system:notification        # System notifications

🔧 Configuration:
   JWT Secret: ${config.jwt.secret.substring(0, 10)}...
   Cache TTL: ${config.cache.ttl}s
   WebSocket Ping Interval: ${config.websocket.pingInterval}ms

📈 Service Dependencies:
   - Auth Service (3001): JWT token validation
   - Store Management (3002): Places, tables data
   - Order Service (3004): Order status, statistics
   - Database: PostgreSQL via Prisma ORM

🎉 Ready to handle dashboard requests!
`);

    // Log WebSocket connection stats periodically
    setInterval(() => {
      const stats = wsManager.getConnectionStats();
      if (stats.totalConnections > 0) {
        console.log(`WebSocket Connections: ${stats.totalConnections} total`);
      }
    }, 60000); // Every minute
  });

  httpServer.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${config.port} is already in use.`);
      console.log(`🔧 Try: lsof -ti:${config.port} | xargs kill -9`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
};

// Start the server
startServer();

// Export for testing
export { httpServer, wsManager };
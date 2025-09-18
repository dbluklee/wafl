const express = require('express');
const app = express();

// Get port from environment variable
const port = process.env.PORT || 3000;
const serviceName = process.env.SERVICE_NAME || 'mock-service';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: serviceName,
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: `${serviceName} mock service is running`,
    port: port
  });
});

// Catch all other routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not implemented in mock service',
    service: serviceName,
    path: req.path
  });
});

app.listen(port, () => {
  console.log(`Mock ${serviceName} service running on port ${port}`);
});
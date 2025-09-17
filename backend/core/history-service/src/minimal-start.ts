import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

console.log('🔧 Starting minimal History Service...');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'history-service',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 4010
  });
});

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`🚀 History Service started on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
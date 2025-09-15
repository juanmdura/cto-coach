// Environment variables are loaded by tsx --env-file flag
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import chatRoutes from './routes/chat';
import documentRoutes from './routes/documents';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.warn('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.error(`🚀 Server running on http://localhost:${PORT}`);
  console.error(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { gameRoutes } from './routes/games.js';
import { playerRoutes } from './routes/players.js';
import { tokenRoutes } from './routes/tokens.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tokens', tokenRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎰 Casino Backend running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation at http://localhost:${PORT}/api/docs`);
});

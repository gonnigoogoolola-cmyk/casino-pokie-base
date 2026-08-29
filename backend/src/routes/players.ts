import { Router, Request, Response } from 'express';

export const playerRoutes = Router();

// Get player stats
playerRoutes.get('/:playerAddress/stats', async (req: Request, res: Response) => {
  try {
    const { playerAddress } = req.params;

    // TODO: Fetch from database
    const stats = {
      playerAddress,
      totalGamesPlayed: 0,
      totalTokensEarned: 0,
      totalScore: 0,
      averageScore: 0,
      highestScore: 0,
      joinDate: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get player balance
playerRoutes.get('/:playerAddress/balance', async (req: Request, res: Response) => {
  try {
    const { playerAddress } = req.params;

    // TODO: Fetch from smart contract
    const balance = {
      playerAddress,
      tokenBalance: '0',
      tokenDecimals: 18,
      formattedBalance: '0',
      lastUpdated: new Date().toISOString(),
    };

    res.json(balance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

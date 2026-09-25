import { Router, Request, Response } from 'express';
import { getDbStatus, connectToMongo, seedDatabaseIfEmpty } from '../db/connection';

export const dbRouter = Router();

// GET database status
dbRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await getDbStatus();
    res.json({
      success: true,
      message: 'Database status fetched successfully',
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get database status',
    });
  }
});

// POST connect to custom MongoDB URI (e.g. MongoDB Atlas)
dbRouter.post('/connect', async (req: Request, res: Response) => {
  try {
    const { uri } = req.body;
    if (!uri || typeof uri !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid MongoDB connection URI is required (e.g. mongodb+srv://... or mongodb://127.0.0.1:27017/dbname)',
      });
    }

    const result = await connectToMongo(uri);
    const status = await getDbStatus();

    res.json({
      success: result.success,
      message: result.message,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to connect to MongoDB',
    });
  }
});

// POST seed database
dbRouter.post('/seed', async (_req: Request, res: Response) => {
  try {
    await seedDatabaseIfEmpty();
    const status = await getDbStatus();
    res.json({
      success: true,
      message: 'Database collections checked and seeded',
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed database',
    });
  }
});

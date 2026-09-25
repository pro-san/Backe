import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { DepartmentModel } from '../models/Department';
import { memoryStore } from '../db/connection';

export const departmentRouter = Router();

departmentRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    let items: any[] = [];
    if (isConnected) {
      items = await DepartmentModel.find();
    } else {
      items = memoryStore.departments;
    }

    res.json({
      success: true,
      message: 'Departments retrieved successfully',
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

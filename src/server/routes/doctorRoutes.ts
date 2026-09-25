import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { DoctorModel } from '../models/Doctor';
import { memoryStore } from '../db/connection';

export const doctorRouter = Router();

doctorRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { department_id, status } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    let items: any[] = [];
    if (isConnected) {
      const query: any = {};
      if (department_id) query.department_id = department_id;
      if (status) query.status = status;
      items = await DoctorModel.find(query);
    } else {
      let filtered = [...memoryStore.doctors];
      if (department_id) {
        filtered = filtered.filter((d) => d.department_id === department_id);
      }
      if (status) {
        filtered = filtered.filter((d) => d.status === status);
      }
      items = filtered;
    }

    res.json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve doctors',
    });
  }
});

doctorRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    let doctor: any = null;
    if (isConnected) {
      if (mongoose.isValidObjectId(id)) {
        doctor = await DoctorModel.findById(id);
      }
      if (!doctor) {
        doctor = await DoctorModel.findOne({ doctor_id: id });
      }
    } else {
      doctor = memoryStore.doctors.find((d) => d.id === id || d.doctor_id === id);
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

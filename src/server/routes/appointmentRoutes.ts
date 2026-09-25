import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { AppointmentModel } from '../models/Appointment';
import { memoryStore } from '../db/connection';

export const appointmentRouter = Router();

appointmentRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { doctor_id, patient_id, status } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    let items: any[] = [];
    if (isConnected) {
      const query: any = {};
      if (doctor_id) query.doctor_id = doctor_id;
      if (patient_id) query.patient_id = patient_id;
      if (status) query.status = status;
      items = await AppointmentModel.find(query).sort({ appointment_date: -1 });
    } else {
      let filtered = [...memoryStore.appointments];
      if (doctor_id) filtered = filtered.filter((a) => a.doctor_id === doctor_id);
      if (patient_id) filtered = filtered.filter((a) => a.patient_id === patient_id);
      if (status) filtered = filtered.filter((a) => a.status === status);
      items = filtered;
    }

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

appointmentRouter.post('/', async (req: Request, res: Response) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const apptNumber = `APT-${Date.now().toString().slice(-6)}`;
    const newRecord = {
      ...req.body,
      appointment_number: apptNumber,
      created_at: new Date().toISOString(),
    };

    let saved: any = null;
    if (isConnected) {
      const doc = new AppointmentModel(newRecord);
      await doc.save();
      saved = doc.toJSON();
    } else {
      saved = { ...newRecord, id: `apt_${Date.now()}` };
    }

    memoryStore.appointments.unshift(saved);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: saved,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

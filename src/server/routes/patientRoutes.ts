import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { PatientModel } from '../models/Patient';
import { memoryStore } from '../db/connection';

export const patientRouter = Router();

// GET all patients
patientRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', per_page = '50' } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    let items: any[] = [];
    if (isConnected) {
      const query: any = {};
      if (status) {
        query.status = status;
      }
      if (search && typeof search === 'string') {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { first_name: regex },
          { last_name: regex },
          { patient_id: regex },
          { phone: regex },
          { email: regex },
        ];
      }
      items = await PatientModel.find(query).sort({ created_at: -1 });
    } else {
      let filtered = [...memoryStore.patients];
      if (status) {
        filtered = filtered.filter((p) => p.status === status);
      }
      if (search && typeof search === 'string') {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.first_name.toLowerCase().includes(term) ||
            p.last_name.toLowerCase().includes(term) ||
            p.patient_id.toLowerCase().includes(term) ||
            p.phone.includes(term) ||
            p.email.toLowerCase().includes(term)
        );
      }
      items = filtered;
    }

    res.json({
      success: true,
      message: 'Patients retrieved successfully',
      data: items,
      meta: {
        source: isConnected ? 'mongodb' : 'memory_cache',
        total: items.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve patients',
    });
  }
});

// GET patient by ID
patientRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    let patient: any = null;
    if (isConnected) {
      if (mongoose.isValidObjectId(id)) {
        patient = await PatientModel.findById(id);
      }
      if (!patient) {
        patient = await PatientModel.findOne({ patient_id: id });
      }
    } else {
      patient = memoryStore.patients.find((p) => p.id === id || p.patient_id === id);
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient not found with ID ${id}`,
      });
    }

    res.json({
      success: true,
      message: 'Patient retrieved successfully',
      data: patient,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve patient',
    });
  }
});

// CREATE patient
patientRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    const patientId =
      body.patient_id ||
      `PAT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newRecord = {
      ...body,
      patient_id: patientId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let savedPatient: any = null;

    if (isConnected) {
      const doc = new PatientModel(newRecord);
      await doc.save();
      savedPatient = doc.toJSON();
    } else {
      savedPatient = {
        ...newRecord,
        id: `pat_mem_${Date.now()}`,
      };
    }

    // Keep memory store in sync
    memoryStore.patients.unshift(savedPatient);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully in MongoDB',
      data: savedPatient,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create patient',
    });
  }
});

// UPDATE patient
patientRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    let updatedPatient: any = null;

    if (isConnected) {
      if (mongoose.isValidObjectId(id)) {
        updatedPatient = await PatientModel.findByIdAndUpdate(id, updateData, { new: true });
      }
      if (!updatedPatient) {
        updatedPatient = await PatientModel.findOneAndUpdate(
          { patient_id: id },
          updateData,
          { new: true }
        );
      }
    }

    // Mirror to memory store
    const memIndex = memoryStore.patients.findIndex((p) => p.id === id || p.patient_id === id);
    if (memIndex !== -1) {
      memoryStore.patients[memIndex] = {
        ...memoryStore.patients[memIndex],
        ...updateData,
      };
      if (!updatedPatient) {
        updatedPatient = memoryStore.patients[memIndex];
      }
    }

    if (!updatedPatient) {
      return res.status(404).json({
        success: false,
        message: `Patient with ID ${id} not found to update`,
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: updatedPatient,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update patient',
    });
  }
});

// DELETE patient
patientRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (isConnected) {
      if (mongoose.isValidObjectId(id)) {
        await PatientModel.findByIdAndDelete(id);
      } else {
        await PatientModel.findOneAndDelete({ patient_id: id });
      }
    }

    memoryStore.patients = memoryStore.patients.filter(
      (p) => p.id !== id && p.patient_id !== id
    );

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      data: { id },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete patient',
    });
  }
});

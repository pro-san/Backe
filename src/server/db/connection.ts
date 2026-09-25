import mongoose from 'mongoose';
import { PatientModel } from '../models/Patient';
import { DoctorModel } from '../models/Doctor';
import { DepartmentModel } from '../models/Department';
import { AppointmentModel } from '../models/Appointment';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_DEPARTMENTS,
  INITIAL_APPOINTMENTS,
} from '../../services/mockData';

let currentUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hospital_management';
let isDbConnected = false;
let lastError: string | null = null;

/**
 * Checks if the URI contains template placeholder brackets or tokens (e.g., <db_username>)
 */
export const isPlaceholderUri = (uri?: string): boolean => {
  if (!uri) return true;
  return /<[^>]+>|<db_username>|<password>|username:password/i.test(uri);
};

// In-memory persistent fallback cache in case MongoDB is offline or in standalone mode
export const memoryStore = {
  patients: [...INITIAL_PATIENTS],
  doctors: [...INITIAL_DOCTORS],
  departments: [...INITIAL_DEPARTMENTS],
  appointments: [...INITIAL_APPOINTMENTS],
};

export const getDbStatus = async () => {
  const readyState = mongoose.connection.readyState;
  isDbConnected = readyState === 1;

  let counts = {
    patients: memoryStore.patients.length,
    doctors: memoryStore.doctors.length,
    departments: memoryStore.departments.length,
    appointments: memoryStore.appointments.length,
  };

  if (isDbConnected) {
    try {
      counts = {
        patients: await PatientModel.countDocuments(),
        doctors: await DoctorModel.countDocuments(),
        departments: await DepartmentModel.countDocuments(),
        appointments: await AppointmentModel.countDocuments(),
      };
    } catch {
      // fallback to memory counts
    }
  }

  // Redact credentials from URI for security
  const safeUri = currentUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  const statusText = isDbConnected
    ? 'Connected'
    : readyState === 2
    ? 'Connecting'
    : isPlaceholderUri(currentUri)
    ? 'In-Memory Active'
    : 'Disconnected (In-Memory Active)';

  return {
    type: 'MongoDB',
    connected: isDbConnected,
    readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    statusText,
    uri: safeUri,
    database: isDbConnected ? mongoose.connection.name : 'hospital_management',
    collections: counts,
    lastError: isPlaceholderUri(currentUri) && !isDbConnected ? null : lastError,
    timestamp: new Date().toISOString(),
  };
};

export const seedDatabaseIfEmpty = async () => {
  try {
    const patientCount = await PatientModel.countDocuments();
    if (patientCount === 0) {
      console.log('🌱 Seeding initial patients to MongoDB...');
      await PatientModel.insertMany(INITIAL_PATIENTS);
    }

    const docCount = await DoctorModel.countDocuments();
    if (docCount === 0) {
      console.log('🌱 Seeding initial doctors to MongoDB...');
      await DoctorModel.insertMany(INITIAL_DOCTORS);
    }

    const deptCount = await DepartmentModel.countDocuments();
    if (deptCount === 0) {
      console.log('🌱 Seeding initial departments to MongoDB...');
      await DepartmentModel.insertMany(INITIAL_DEPARTMENTS);
    }

    const apptCount = await AppointmentModel.countDocuments();
    if (apptCount === 0) {
      console.log('🌱 Seeding initial appointments to MongoDB...');
      await AppointmentModel.insertMany(INITIAL_APPOINTMENTS);
    }

    console.log('✅ MongoDB database seeding complete.');
  } catch (err: any) {
    console.log('Database seeding note:', err?.message || err);
  }
};

export const connectToMongo = async (customUri?: string): Promise<{ success: boolean; message: string }> => {
  if (customUri) {
    currentUri = customUri;
  }

  // If URI has unresolved placeholders (e.g., <db_username>), operate in responsive in-memory mode smoothly
  if (isPlaceholderUri(currentUri)) {
    isDbConnected = false;
    lastError = null;
    console.log('⚡ Operating in high-performance in-memory mode. To link an external MongoDB Atlas cluster, update credentials in the Database connection dialog.');
    return {
      success: false,
      message: 'MongoDB URI contains unreplaced placeholder tokens (e.g. <db_username>). Operating in standalone in-memory mode.',
    };
  }

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log(`📡 Connecting to MongoDB at ${currentUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')} ...`);
    await mongoose.connect(currentUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });

    isDbConnected = true;
    lastError = null;
    console.log('🎉 Successfully connected to MongoDB database!');

    // Seed if empty
    await seedDatabaseIfEmpty();

    return {
      success: true,
      message: 'Successfully connected to MongoDB database.',
    };
  } catch (err: any) {
    isDbConnected = false;
    const errMsg = err?.message || 'Could not connect to MongoDB server';
    lastError = errMsg;
    console.log(`Database connection notice: ${errMsg}. Operating in responsive in-memory mode.`);
    return {
      success: false,
      message: errMsg,
    };
  }
};

import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  patient_id: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string;
  phone: string;
  email: string;
  address?: string;
  blood_group?: string;
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  emergency_contact?: string;
  emergency_phone?: string;
  allergies?: string;
  medical_notes?: string;
  status: 'Active' | 'Inactive' | 'Deceased';
  created_at: string;
  updated_at?: string;
}

const PatientSchema = new Schema<IPatient>(
  {
    patient_id: { type: String, required: true, unique: true, index: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    date_of_birth: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    blood_group: { type: String, default: '' },
    marital_status: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
    emergency_contact: { type: String, default: '' },
    emergency_phone: { type: String, default: '' },
    allergies: { type: String, default: '' },
    medical_notes: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive', 'Deceased'], default: 'Active' },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.patient_id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

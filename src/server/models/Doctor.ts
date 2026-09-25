import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  doctor_id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  specialization: string;
  department_id: string;
  department_name: string;
  license_number: string;
  experience: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  available_days?: string[];
  schedule?: string;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    doctor_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    specialization: { type: String, required: true },
    department_id: { type: String, required: true },
    department_name: { type: String, required: true },
    license_number: { type: String, required: true },
    experience: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
    available_days: [{ type: String }],
    schedule: { type: String, default: '' },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.doctor_id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DoctorModel = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointment_number: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  doctor_id: string;
  doctor_name: string;
  department_id: string;
  department_name: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  reason: string;
  notes?: string;
  status: string;
  created_at?: string;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointment_number: { type: String, required: true, unique: true, index: true },
    patient_id: { type: String, required: true },
    patient_name: { type: String, required: true },
    patient_phone: { type: String },
    doctor_id: { type: String, required: true },
    doctor_name: { type: String, required: true },
    department_id: { type: String, required: true },
    department_name: { type: String, required: true },
    appointment_date: { type: String, required: true },
    appointment_time: { type: String, required: true },
    type: { type: String, default: 'General Checkup' },
    reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, default: 'Scheduled' },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.appointment_number;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

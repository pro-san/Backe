import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  department_id: string;
  name: string;
  code: string;
  description: string;
  head_doctor: string;
  head_doctor_id?: string;
  phone: string;
  status: 'Active' | 'Inactive';
  total_doctors: number;
  total_beds: number;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    department_id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, default: '' },
    head_doctor: { type: String, required: true },
    head_doctor_id: { type: String },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    total_doctors: { type: Number, default: 0 },
    total_beds: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.department_id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DepartmentModel = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);

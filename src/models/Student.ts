import mongoose from '../db/conn'
import { AddressObj } from './AddressObj'
const { Schema } = mongoose

const Student = mongoose.model(
  'Student',
  new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cpf: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    address: AddressObj,
    gender: { type: String, enum: ['Male', 'Female', 'Others'] },
    email: { type: String },
    rg: { type: String },
    birthdate: { type: Date },
    images: { type: Array },
    exams: { type: Array },
    deletedAt: { type: Date },
  }, { timestamps: true })
)

export default Student
import mongoose from '../db/conn'
import { AddressObj } from './AddressObj'
const { Schema } = mongoose

const Teacher = mongoose.model(
  'Teacher',
  new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cpf: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    address: AddressObj,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    email: { type: String },
    rg: { type: String },
    birthdate: { type: Date },
    images: { type: Array },
    certificates: { type: Array },
    deletedAt: { type: Date },
  }, { timestamps: true })
)

export default Teacher
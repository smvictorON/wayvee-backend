import mongoose from '../db/conn'
import { AddressObj } from './AddressObj'
const { Schema } = mongoose

const Company = mongoose.model(
  'Company',
  new Schema({
    name: { type: String, required: true },
    cnpj: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: AddressObj,
    deletedAt: { type: Date },
    images: { type: Array },
  }, { timestamps: true })
)

export default Company
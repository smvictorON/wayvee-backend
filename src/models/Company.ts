import mongoose from '../db/conn'
const { Schema } = mongoose

const Company = mongoose.model(
  'Company',
  new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cnpj: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    },
    email: { type: String },
  }, { timestamps: true })
)

export default Company
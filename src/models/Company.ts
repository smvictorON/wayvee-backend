import mongoose from '../db/conn'
const { Schema } = mongoose

const Company = mongoose.model(
  'Company',
  new Schema({
    name: { type: String, required: true },
    cnpj: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: {
      street: { type: String },
      number: { type: Number },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    },
    deletedAt: { type: Date },
    images: { type: Array },
  }, { timestamps: true })
)

export default Company
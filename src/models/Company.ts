import mongoose from '../db/conn'
const { Schema } = mongoose

const Company = mongoose.model(
  'Company',
  new Schema({
    name: { type: String, required: true },
    cnpj: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    },
    deletedAt: { type: Date },
    image: { type: String },
  }, { timestamps: true })
)

export default Company
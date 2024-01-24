import mongoose from '../db/conn'
const { Schema } = mongoose

const Teacher = mongoose.model(
  'Teacher',
  new Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    cpf: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    },
    email: { type: String },
    rg: { type: String },
    birthdate: { type: Date },
    images: { type: Array },
    certificates: { type: Array },
  }, { timestamps: true })
)

export default Teacher
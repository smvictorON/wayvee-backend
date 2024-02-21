import mongoose from '../db/conn'
const { Schema } = mongoose

const User = mongoose.model(
  'User',
  new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    image: { type: String },
    isSuper: { type: Boolean },
    deletedAt: { type: Date },
  }, { timestamps: true })
)

export default User;

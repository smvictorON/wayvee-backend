import mongoose from '../db/conn'
const { Schema } = mongoose

const Settings = mongoose.model(
  'Settings',
  new Schema({
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
  }, { timestamps: true })
)

export default Settings
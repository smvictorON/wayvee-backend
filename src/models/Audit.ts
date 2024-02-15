import mongoose from '../db/conn'
const { Schema } = mongoose

const Audit = mongoose.model(
  'Audit',
  new Schema({
    model: { type: String, required: true },
    idDocument: { type: Schema.Types.ObjectId, required: true },
    before: { type: Object, required: true },
    after: { type: Object, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  }, { timestamps: true })
)

export default Audit
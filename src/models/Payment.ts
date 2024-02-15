import mongoose from '../db/conn'
const { Schema } = mongoose

const Payment = mongoose.model(
  'Payment',
  new Schema({
    date: { type: Date, required: true },
    receiver: { type: Schema.Types.ObjectId, required: true },
    payer: { type: Schema.Types.ObjectId, required: true },
    value: { type: Number, required: true },
    type: { type: String, enum: ['Receipt', 'Payment'], required: true  },
    method: { type: String, enum: ['Cash', 'Card', 'Pix', 'Check'], required: true  },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    deletedAt: { type: Date },
  }, { timestamps: true })
)

export default Payment
import mongoose from '../db/conn'
const { Schema } = mongoose

const Lesson = mongoose.model(
  'Lesson',
  new Schema({
    date: { type: String, required: true },
    hour_start: { type: String, required: true },
    hour_end: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student', required: true  }],
    classroom: { type: String },
    subject: { type: String },
    observation: { type: String },
    status: { type: String, enum: ['Active', 'Cancelled', 'Done'] },
  }, { timestamps: true })
)

export default Lesson
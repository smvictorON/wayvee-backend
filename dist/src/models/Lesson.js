"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = __importDefault(require("../db/conn"));
const { Schema } = conn_1.default;
const Lesson = conn_1.default.model('Lesson', new Schema({
    day: { type: String, required: true },
    hour_start: { type: String, required: true },
    hour_end: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    class: { type: String },
    subject: { type: String },
    observation: { type: String },
    status: { type: String, enum: ['Active', 'Cancelled', 'Done'] },
}, { timestamps: true }));
exports.default = Lesson;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = __importDefault(require("../db/conn"));
const { Schema } = conn_1.default;
const Teacher = conn_1.default.model('Teacher', new Schema({
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
}, { timestamps: true }));
exports.default = Teacher;

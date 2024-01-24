"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conn_1 = __importDefault(require("../db/conn"));
const { Schema } = conn_1.default;
const Pet = conn_1.default.model('Pet', new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    color: { type: String, required: true },
    images: { type: Array, required: true },
    available: { type: Boolean, required: true },
    user: Object,
    adopter: Object
}, { timestamps: true }));
exports.default = Pet;

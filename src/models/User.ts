import mongoose, { Document, Schema, Types } from 'mongoose';

interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  company: Types.ObjectId | string;
  image?: string;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  image: { type: String },
}, { timestamps: true });

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;

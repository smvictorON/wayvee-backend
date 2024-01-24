import mongoose, { Document, Schema } from 'mongoose';

interface User {
  name: string;
  email: string;
  password: string;
  image?: string;
  phone: string;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },
  phone: { type: String, required: true },
}, { timestamps: true });

const UserModel = mongoose.model<UserDocument>('User', userSchema);

export default UserModel;

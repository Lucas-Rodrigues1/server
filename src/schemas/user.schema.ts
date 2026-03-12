import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true},
  name: { type: String, required: true },
  password: { type: String, required: true },
});

export const User = model<IUser>('User', userSchema);

import { Schema, model, Document } from 'mongoose';

export type UserStatus = 'online' | 'offline' | 'ausente' | 'ocupado';

export interface IUser extends Document {
  username: string;
  name: string;
  password: string;
  status: UserStatus;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['online', 'offline', 'ausente', 'ocupado'], default: 'offline' },
});

export const User = model<IUser>('User', userSchema);

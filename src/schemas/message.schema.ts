import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  imageUrl?: string;
}

const messageSchema = new Schema<IMessage>({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  imageUrl: { type: String, default: null },
}, { timestamps: true });

export const Message = model<IMessage>('Message', messageSchema);

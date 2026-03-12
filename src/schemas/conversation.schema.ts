import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  archivedBy: Types.ObjectId[];
  deletedBy: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  archivedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  deletedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

export const Conversation = model<IConversation>('Conversation', conversationSchema);

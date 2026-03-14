import { Message } from '../schemas/message.schema';
import type { MessageType } from '../schemas/message.schema';

class MessageRepository {
  async create(conversationId: string, senderId: string, content: string, type: MessageType = 'text', imageUrl?: string) {
    return await Message.create({ conversation: conversationId, sender: senderId, content, type, imageUrl: imageUrl || undefined });
  }

  async findByConversation(conversationId: string, limit = 50, before?: string) {
    const query: any = { conversation: conversationId };
    if (before) query._id = { $lt: before };
    return await Message.find(query)
      .populate('sender', 'username name')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

export default new MessageRepository();

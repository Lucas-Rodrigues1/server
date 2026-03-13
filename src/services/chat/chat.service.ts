import ConversationRepository from '../../repository/conversation.repository';
import MessageRepository from '../../repository/message.repository';

class ChatService {
  async startConversation(userId: string, friendId: string) {
    return await ConversationRepository.findOrCreate(userId, friendId);
  }

  async listConversations(userId: string) {
    return await ConversationRepository.findByUser(userId);
  }

  async listArchivedConversations(userId: string) {
    return await ConversationRepository.findArchivedByUser(userId);
  }

  async getConversation(conversationId: string, userId: string) {
    const conv = await ConversationRepository.findById(conversationId);
    if (!conv) return null;
    const isMember = conv.participants.some((p: any) => {
      const id = p?._id ?? p;
      return id?.toString() === userId;
    });
    return isMember ? conv : null;
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const message = await MessageRepository.create(conversationId, senderId, content);
    await ConversationRepository.setLastMessage(conversationId, (message._id as any).toString());
    return message;
  }

  async getMessages(conversationId: string, userId: string, limit?: number, before?: string) {
    const conv = await this.getConversation(conversationId, userId);
    if (!conv) return null;
    return await MessageRepository.findByConversation(conversationId, limit, before);
  }

  async incrementUnread(conversationId: string, userId: string) {
    return await ConversationRepository.incrementUnread(conversationId, userId);
  }

  async resetUnread(conversationId: string, userId: string) {
    return await ConversationRepository.resetUnread(conversationId, userId);
  }

  async archiveConversation(conversationId: string, userId: string) {
    const conv = await this.getConversation(conversationId, userId);
    if (!conv) return { success: false, error: 'Conversa não encontrada' };
    await ConversationRepository.archive(conversationId, userId);
    return { success: true };
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conv = await this.getConversation(conversationId, userId);
    if (!conv) return { success: false, error: 'Conversa não encontrada' };
    await ConversationRepository.softDelete(conversationId, userId);
    return { success: true };
  }
}

export default new ChatService();
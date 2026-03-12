import { Conversation } from '../schemas/conversation.schema';

class ConversationRepository {
  async findOrCreate(userA: string, userB: string) {
    const existing = await Conversation.findOne({
      participants: { $all: [userA, userB], $size: 2 },
      deletedBy: { $nin: [userA] },
    });
    if (existing) return existing;
    return await Conversation.create({ participants: [userA, userB] });
  }

  async findByUser(userId: string) {
    return await Conversation.find({
      participants: userId,
      deletedBy: { $nin: [userId] },
    })
      .populate('participants', 'username name')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  }

  async findById(id: string) {
    return await Conversation.findById(id);
  }

  async setLastMessage(conversationId: string, messageId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: messageId, updatedAt: new Date() },
      { new: true },
    );
  }

  async archive(conversationId: string, userId: string) {
    const conv = await Conversation.findById(conversationId);
    if (!conv) return null;
    const alreadyArchived = conv.archivedBy.some(id => id.toString() === userId);
    const update = alreadyArchived
      ? { $pull: { archivedBy: userId } }
      : { $addToSet: { archivedBy: userId } };
    return await Conversation.findByIdAndUpdate(conversationId, update, { new: true });
  }

  async softDelete(conversationId: string, userId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { deletedBy: userId } },
      { new: true },
    );
  }
}

export default new ConversationRepository();

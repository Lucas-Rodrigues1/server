import { Conversation } from '../schemas/conversation.schema';

class ConversationRepository {
  async findOrCreate(userA: string, userB: string) {
    const existing = await Conversation.findOne({
      participants: { $all: [userA, userB], $size: 2 },
      deletedBy: { $nin: [userA] },
    }).populate('participants', 'username name status avatar');
    if (existing) return existing;
    const created = await Conversation.create({ participants: [userA, userB] });
    return await Conversation.findById(created._id).populate('participants', 'username name status avatar');
  }

  async findByUser(userId: string) {
    return await Conversation.find({
      participants: userId,
      deletedBy: { $nin: [userId] },
      archivedBy: { $nin: [userId] },
    })
      .populate('participants', 'username name status avatar')
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
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { archivedBy: userId } },
      { new: true },
    );
  }

  async unarchive(conversationId: string, userId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $pull: { archivedBy: userId } },
      { new: true },
    );
  }

  async softDelete(conversationId: string, userId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { deletedBy: userId } },
      { new: true },
    );
  }

  async findArchivedByUser(userId: string) {
    return await Conversation.find({
      participants: userId,
      archivedBy: userId,
      deletedBy: { $nin: [userId] },
    })
      .populate('participants', 'username name status avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
  }

  async incrementUnread(conversationId: string, userId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $inc: { [`unreadCounts.${userId}`]: 1 } },
      { new: true },
    );
  }

  async resetUnread(conversationId: string, userId: string) {
    return await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`unreadCounts.${userId}`]: 0 } },
      { new: true },
    );
  }
}

export default new ConversationRepository();

import { Friendship, IFriendship } from '../schemas/friendship.schema';

class FriendshipRepository {
  async create(requesterId: string, recipientId: string) {
    return await Friendship.create({ requester: requesterId, recipient: recipientId });
  }

  async findById(id: string) {
    return await Friendship.findById(id);
  }

  async findBetween(userA: string, userB: string) {
    return await Friendship.findOne({
      $or: [
        { requester: userA, recipient: userB },
        { requester: userB, recipient: userA },
      ],
    });
  }

  async findPendingReceived(userId: string) {
    return await Friendship.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'username name');
  }

  async findAccepted(userId: string) {
    return await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted',
    })
      .populate('requester', 'username name')
      .populate('recipient', 'username name');
  }

  async updateStatus(id: string, status: IFriendship['status']) {
    return await Friendship.findByIdAndUpdate(id, { status }, { new: true });
  }

  async delete(id: string) {
    return await Friendship.findByIdAndDelete(id);
  }
}

export default new FriendshipRepository();

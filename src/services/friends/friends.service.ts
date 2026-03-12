import FriendshipRepository from '../../repository/friendship.repository';
import { emitTriggerTo } from '../../socket';

class FriendsService {
  async sendRequest(requesterId: string, recipientId: string) {
    if (requesterId === recipientId) {
      return { success: false, error: 'Não é possível adicionar você mesmo' };
    }
    const existing = await FriendshipRepository.findBetween(requesterId, recipientId);
    if (existing) {
      return { success: false, error: 'Solicitação já existe ou vocês já são amigos' };
    }
    const friendship = await FriendshipRepository.create(requesterId, recipientId);
    emitTriggerTo(recipientId, 'friend:request', { friendshipId: friendship._id, requesterId });
    return { success: true, friendship };
  }

  async acceptRequest(friendshipId: string, userId: string) {
    const friendship = await FriendshipRepository.findById(friendshipId);
    if (!friendship || friendship.recipient.toString() !== userId) {
      return { success: false, error: 'Solicitação não encontrada' };
    }
    if (friendship.status !== 'pending') {
      return { success: false, error: 'Solicitação já foi processada' };
    }
    const updated = await FriendshipRepository.updateStatus(friendshipId, 'accepted');
    // Notify the requester that their invite was accepted
    emitTriggerTo(friendship.requester.toString(), 'friend:accepted', { friendshipId, acceptedBy: userId });
    // Also notify the accepter so their own friends list / conversations update via socket
    emitTriggerTo(userId, 'friend:accepted', { friendshipId, acceptedBy: userId });
    return { success: true, friendship: updated };
  }

  async rejectRequest(friendshipId: string, userId: string) {
    const friendship = await FriendshipRepository.findById(friendshipId);
    if (!friendship || friendship.recipient.toString() !== userId) {
      return { success: false, error: 'Solicitação não encontrada' };
    }
    await FriendshipRepository.updateStatus(friendshipId, 'rejected');
    return { success: true };
  }

  async removeFriend(friendshipId: string, userId: string) {
    const friendship = await FriendshipRepository.findById(friendshipId);
    if (!friendship) return { success: false, error: 'Vínculo não encontrado' };
    const isParticipant =
      friendship.requester.toString() === userId ||
      friendship.recipient.toString() === userId;
    if (!isParticipant) return { success: false, error: 'Sem permissão' };
    await FriendshipRepository.delete(friendshipId);
    return { success: true };
  }

  async listRequests(userId: string) {
    return await FriendshipRepository.findPendingReceived(userId);
  }

  async listFriends(userId: string) {
    return await FriendshipRepository.findAccepted(userId);
  }
}

export default new FriendsService();

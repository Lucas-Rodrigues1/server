import { onTrigger, emitTriggerTo } from '../socket';
import ChatService from '../services/chat/chat.service';
import UsersService from '../services/users/users.service';
import FriendshipRepository from '../repository/friendship.repository';
import { UserStatus } from '../schemas/user.schema';

interface SendMessageData {
  conversationId: string;
  content: string;
  tempId: string;
}

interface TypingData {
  conversationId: string;
}

interface StatusChangeData {
  status: UserStatus;
}

interface ReadMessageData {
  conversationId: string;
}

export function registerChatHandlers() {
  onTrigger<StatusChangeData>('status:change', async (socket, data) => {
    const user = (socket as any).user;
    const valid: UserStatus[] = ['online', 'offline', 'ausente', 'ocupado'];
    if (!valid.includes(data.status)) return;
    await UsersService.updateStatus(user.id, data.status);
    const friendships = await FriendshipRepository.findAccepted(user.id);
    const payload = { userId: user.id, username: user.username, status: data.status };
    for (const f of friendships) {
      const friendId = (f.requester as any)._id?.toString() === user.id
        ? (f.recipient as any)._id?.toString()
        : (f.requester as any)._id?.toString();
      if (friendId) {
        emitTriggerTo(friendId, 'user:status', payload);
      }
    }
    // Also notify the user themselves (other tabs)
    socket.emit('trigger-event', { event: 'user:status', data: payload });
  });

  onTrigger<TypingData>('typing:start', async (socket, data) => {
    const user = (socket as any).user;
    const { conversationId } = data;
    const conversation = await ChatService.getConversation(conversationId, user.id);
    if (!conversation) return;
    const recipientId = conversation.participants
      .find(p => p.toString() !== user.id)?.toString();
    if (recipientId) {
      emitTriggerTo(recipientId, 'typing:start', { conversationId, userId: user.id, username: user.username });
    }
  });

  onTrigger<TypingData>('typing:stop', async (socket, data) => {
    const user = (socket as any).user;
    const { conversationId } = data;
    const conversation = await ChatService.getConversation(conversationId, user.id);
    if (!conversation) return;
    const recipientId = conversation.participants
      .find(p => p.toString() !== user.id)?.toString();
    if (recipientId) {
      emitTriggerTo(recipientId, 'typing:stop', { conversationId, userId: user.id });
    }
  });

  onTrigger<ReadMessageData>('message:read', async (socket, data) => {
    const user = (socket as any).user;
    const { conversationId } = data;
    const conversation = await ChatService.getConversation(conversationId, user.id);
    if (!conversation) return;
    await ChatService.resetUnread(conversationId, user.id);
    const recipientId = conversation.participants
      .find(p => p.toString() !== user.id)?.toString();
    if (recipientId) {
      emitTriggerTo(recipientId, 'message:read', { conversationId });
    }
  });

  onTrigger<SendMessageData>('message:send', async (socket, data) => {
    const user = (socket as any).user;
    const { conversationId, content, tempId } = data;

    if (!conversationId || !content?.trim()) {
      socket.emit('trigger-event', { event: 'message:error', data: { tempId, error: 'Dados inválidos' } });
      return;
    }

    const conversation = await ChatService.getConversation(conversationId, user.id);
    if (!conversation) {
      socket.emit('trigger-event', { event: 'message:error', data: { tempId, error: 'Conversa não encontrada' } });
      return;
    }

    const message = await ChatService.saveMessage(conversationId, user.id, content.trim());

    const recipientId = conversation.participants
      .find(p => p.toString() !== user.id)
      ?.toString();

    const payload = {
      _id: message._id,
      conversationId,
      sender: { id: user.id, username: user.username },
      content: content.trim(),
      tempId,
      createdAt: (message as any).createdAt,
    };

    if (recipientId) {
      emitTriggerTo(recipientId, 'message:new', payload);
      await ChatService.incrementUnread(conversationId, recipientId);
    }

    socket.emit('trigger-event', { event: 'message:ack', data: payload });
  });
}
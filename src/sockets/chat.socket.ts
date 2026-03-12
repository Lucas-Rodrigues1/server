import { onTrigger, emitTriggerTo } from '../socket';
import ChatService from '../services/chat/chat.service';

interface SendMessageData {
  conversationId: string;
  content: string;
  tempId: string;
}

export function registerChatHandlers() {
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
    }

    socket.emit('trigger-event', { event: 'message:ack', data: payload });
  });
}

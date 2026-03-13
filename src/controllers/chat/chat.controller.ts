import { Request, Response } from 'express';
import ChatService from '../../services/chat/chat.service';

class ChatController {
  async startConversation(req: Request, res: Response) {
    const user = (req as any).user;
    const { friendId } = req.body;
    if (!friendId) return res.status(400).json({ success: false, error: 'friendId é obrigatório' });
    const conversation = await ChatService.startConversation(user.id, friendId);
    return res.status(200).json({ success: true, conversation });
  }

  async listConversations(req: Request, res: Response) {
    const user = (req as any).user;
    const conversations = await ChatService.listConversations(user.id);
    const result = conversations.map((c: any) => {
      const obj = c.toObject();
      const m = c.unreadCounts;
      obj.unreadCount = m ? (typeof m.get === 'function' ? m.get(user.id) ?? 0 : m[user.id] ?? 0) : 0;
      return obj;
    });
    return res.json({ success: true, conversations: result });
  }

  async listArchivedConversations(req: Request, res: Response) {
    const user = (req as any).user;
    const conversations = await ChatService.listArchivedConversations(user.id);
    const result = conversations.map((c: any) => {
      const obj = c.toObject();
      const m = c.unreadCounts;
      obj.unreadCount = m ? (typeof m.get === 'function' ? m.get(user.id) ?? 0 : m[user.id] ?? 0) : 0;
      return obj;
    });
    return res.json({ success: true, conversations: result });
  }

  async getMessages(req: Request, res: Response) {
    const user = (req as any).user;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const before = req.query.before as string | undefined;
    const messages = await ChatService.getMessages(req.params.id as string, user.id, limit, before);
    if (!messages) return res.status(404).json({ success: false, error: 'Conversa não encontrada' });
    return res.json({ success: true, messages });
  }

  async archiveConversation(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await ChatService.archiveConversation(req.params.id as string, user.id);
    return res.status(result.success ? 200 : 404).json(result);
  }

  async deleteConversation(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await ChatService.deleteConversation(req.params.id as string, user.id);
    return res.status(result.success ? 200 : 404).json(result);
  }
}

export default new ChatController();

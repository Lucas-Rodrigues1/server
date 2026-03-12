import { Request, Response } from 'express';
import FriendsService from '../../services/friends/friends.service';

class FriendsController {
  async sendRequest(req: Request, res: Response) {
    const user = (req as any).user;
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ success: false, error: 'recipientId é obrigatório' });
    const result = await FriendsService.sendRequest(user.id, recipientId);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async acceptRequest(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await FriendsService.acceptRequest(req.params.id as string, user.id);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async rejectRequest(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await FriendsService.rejectRequest(req.params.id as string, user.id);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async removeFriend(req: Request, res: Response) {
    const user = (req as any).user;
    const result = await FriendsService.removeFriend(req.params.id as string, user.id);
    return res.status(result.success ? 200 : 400).json(result);
  }

  async listRequests(req: Request, res: Response) {
    const user = (req as any).user;
    const requests = await FriendsService.listRequests(user.id);
    return res.json({ success: true, requests });
  }

  async listFriends(req: Request, res: Response) {
    const user = (req as any).user;
    const friends = await FriendsService.listFriends(user.id);
    return res.json({ success: true, friends });
  }
}

export default new FriendsController();

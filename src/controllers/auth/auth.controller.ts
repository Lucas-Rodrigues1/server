import { Request, Response } from 'express';
import AuthService from '../../services/auth/auth.service';

class AuthController {
  async login(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
    }
    const result = await AuthService.login(user);
    return res.json(result);
  }
}

export default new AuthController();

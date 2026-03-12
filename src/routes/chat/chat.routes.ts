import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth';
import ChatController from '../../controllers/chat/chat.controller';

const router = Router();

router.use(authenticateJWT);

router.post('/conversations', (req, res) => ChatController.startConversation(req, res));
router.get('/conversations', (req, res) => ChatController.listConversations(req, res));
router.get('/conversations/:id/messages', (req, res) => ChatController.getMessages(req, res));
router.patch('/conversations/:id/archive', (req, res) => ChatController.archiveConversation(req, res));
router.delete('/conversations/:id', (req, res) => ChatController.deleteConversation(req, res));

export default router;

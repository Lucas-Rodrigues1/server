import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth';
import FriendsController from '../../controllers/friends/friends.controller';

const router = Router();

router.use(authenticateJWT);

router.post('/request', (req, res) => FriendsController.sendRequest(req, res));
router.get('/requests', (req, res) => FriendsController.listRequests(req, res));
router.get('/', (req, res) => FriendsController.listFriends(req, res));
router.post('/accept/:id', (req, res) => FriendsController.acceptRequest(req, res));
router.post('/reject/:id', (req, res) => FriendsController.rejectRequest(req, res));
router.delete('/:id', (req, res) => FriendsController.removeFriend(req, res));

export default router;

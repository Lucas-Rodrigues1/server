import { Router } from "express";
import passport from 'passport';
import { authenticateJWT } from '../../middlewares/auth';
import AuthController from "../../controllers/auth/auth.controller";

const router = Router();

router.post('/login', (req, res, next) => {
    passport.authenticate('login-strategy', { session: false }, (err: any, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info?.message || 'Authentication failed' });
        }
        (req as any).user = user;
        AuthController.login(req, res);
    })(req, res, next);
});

router.get('/profile', authenticateJWT, (req: any, res) => {
    const { password, ...safeUser } = req.user.toObject ? req.user.toObject() : req.user;
    res.json({ success: true, user: safeUser });
});

export default router;

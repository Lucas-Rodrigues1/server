import { Router } from "express";
import UsersController from "../../controllers/users/users.controller";
import UsersService from "../../services/users/users.service";
import { authenticateJWT } from "../../middlewares/auth";
import { CreateUserDTO } from "../../dtos/createUser.dto";
import { UserStatus } from "../../schemas/user.schema";

const router = Router();

router.post("/create", async (req, res) => {
    const { name, username, password }: CreateUserDTO = req.body;
    if (!name || !username || !password) {
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!username) missingFields.push('username');
        if (!password) missingFields.push('password');
        res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        return;
    }
    const result = await UsersController.create({ name, username, password });
    
    if (!(result as any).success) {
        const isDuplicateError = (result as any).errorDetails?.includes('E11000');
        const statusCode = isDuplicateError ? 409 : 400;
        res.status(statusCode).json(result);
        return;
    }
    
    res.status(201).json(result);
});

router.get('/search', authenticateJWT, async (req: any, res) => {
    const q = (req.query.q as string)?.trim();
    if (!q) return res.status(400).json({ success: false, error: 'Parâmetro q é obrigatório' });
    const users = await UsersService.search(q, req.user.id);
    res.json({ success: true, users });
});

// Status is managed via socket (status:change event), not REST.

router.patch('/status', authenticateJWT, async (req: any, res) => {
    const { status } = req.body as { status: UserStatus };
    const valid: UserStatus[] = ['online', 'offline', 'ausente', 'ocupado'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, error: 'Status inválido' });
    await UsersService.updateStatus(req.user.id, status);
    res.json({ success: true });
});

export default router;
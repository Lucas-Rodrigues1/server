import { Router } from "express";
import UsersController from "../../controllers/users/users.controller";
import { CreateUserDTO } from "../../dtos/createUser.dto";

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

export default router;
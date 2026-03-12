import { Router } from "express";
import UsersController from "../../controllers/users.controller";

const router = Router();

router.post("/create", async (req, res) => {
    const { name, username, password }: CreateUserDTO = req.body;

    if (!name || !username || !password) {
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!username) missingFields.push('username');
        if (!password) missingFields.push('password');
        res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    const result = await UsersController.create( name, username, password);
    res.json(result);
});



export default router;
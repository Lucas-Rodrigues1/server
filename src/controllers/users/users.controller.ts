import { Request, Response } from 'express';
import UsersService from '../../services/users/users.service';
import { CreateUserDTO } from '../../dtos/createUser.dto';



class UsersController {
    async create(data: CreateUserDTO): Promise<Object> {
        try {
            return await UsersService.create(data);
        } catch (error) {
                console.error('Error creating user:', error);
                return { error: 'Failed to create user', errorDetails: error };
        }
    }
}

export default new UsersController();
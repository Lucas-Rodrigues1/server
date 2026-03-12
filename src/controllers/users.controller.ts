import { Request, Response } from 'express';



class UsersController {
    async create( name: string, username: string, password: string): Promise<Object> {
        try {
            return {success:"Ok", message: `User ${name} created with username ${username}`};

        } catch (error) {
                console.error('Error creating user:', error);
                return { error: 'Failed to create user', errorDetails: error };
        }
    }
}

export default new UsersController();
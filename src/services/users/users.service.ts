import UsersRepository from '../../repository/user.repository';
import { CreateUserDTO } from '../../dtos/createUser.dto';

class UsersService {
    async create(data: CreateUserDTO) {
        try {
            const user = await UsersRepository.create(data);
            return { success: true, message: `User ${data.name} created with username ${data.username}`, user };
        } catch (error: any) {
            console.error('Error creating user:', error);
            return { success: false, error: 'Failed to create user', errorDetails: error?.message || 'error any' };
        }
    }

}

export default new UsersService();

import UsersRepository from '../../repository/user.repository';
import { CreateUserDTO } from '../../dtos/createUser.dto';
import bcrypt from 'bcrypt';


class UsersService {
    async create(data: CreateUserDTO) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(data.password, salt);
            const user = await UsersRepository.create({
                ...data,
                password: hashed,
            });
            return { success: true, message: `User ${data.name} created with username ${data.username}` };
        } catch (error: any) {
            console.error('Error creating user:', error);
            return { success: false, error: 'Failed to create user', errorDetails: error?.message || 'error any' };
        }
    }

    async findAll() {
        return await UsersRepository.findAll();
    }

    async findByUsername(username: string) {
        return await UsersRepository.findByUsername(username);
    }

    async findById(id: string) {
        return await UsersRepository.findById(id);
    }

    async verifyPassword(user: any, plain: string) {
        return await bcrypt.compare(plain, user.password);
    }

    async search(query: string, excludeId: string) {
        return await UsersRepository.search(query, excludeId);
    }
}

export default new UsersService();

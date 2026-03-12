import { CreateUserDTO } from "../dtos/createUser.dto";
import { User } from "../schemas/user.schema";

class UsersRepository {
 async create(data:CreateUserDTO) {
    return await User.create(data);
  }

  async findAll() {
    return await User.find();
  }

  async findByUsername(username: string) {
    return await User.findOne({ username });
  }

  async findById(id: string) {
    return await User.findById(id);
  }
}

export default new UsersRepository();
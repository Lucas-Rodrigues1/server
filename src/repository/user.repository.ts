import { CreateUserDTO } from "../dtos/createUser.dto";
import { User } from "../schemas/user.schema";

class UsersRepository {
 async create(data:CreateUserDTO) {
    return await User.create(data);
  }
}

export default new UsersRepository();
import { generateJWT } from '../../middlewares/jwt';

class AuthService {
  async login(user: any) {
    try {
      const token = generateJWT(user);
      const { password, ...safeUser } = user.toObject ? user.toObject() : user;
      return {
        success: true,
        token,
        user: safeUser,
      };
    } catch (error: any) {
      console.error('Error during login:', error);
      return {
        success: false,
        error: 'Failed to login',
        errorDetails: error?.message || 'Unknown error',
      };
    }
  }
}

export default new AuthService();

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined. Please set it before starting the application.');
}

export { JWT_SECRET };

export const generateJWT = (user: any): string => {
  return jwt.sign(
    { id: user._id, username: user.username, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const verifyJWT = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

import jwt from 'jsonwebtoken';

export function getUser(token: string): any {
  try {
    if (token) {
      return jwt.verify(token, process.env.JWT_SECRET || '');
    }
    return null;
  } catch (err) {
    return null;
  }
}

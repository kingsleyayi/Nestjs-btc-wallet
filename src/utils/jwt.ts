import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../config/config';

export const decodeJwt = async (token): Promise<any> => {
  type MyToken = {
    sub: string;
    iat: number;
    exp: number;
  };

  try {
    const decode = (await jwt.verify(token, jwtSecret)) as unknown as MyToken;
    return decode;
  } catch (error) {
    return 'invalid';
  }
};

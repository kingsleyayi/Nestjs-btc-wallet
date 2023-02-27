import * as jwt from 'jsonwebtoken';
import { adminJwtSecret, jwtSecret } from '../config/config';
import { User, UserModel, UserSchema } from '../schema/user.schema';

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

export const decodeAdminJwt = async (token): Promise<any> => {
  type MyToken = {
    sub: number;
    hederaId: string;
    iat: number;
    exp: number;
  };

  try {
    const decode = (await jwt.verify(
      token,
      adminJwtSecret,
    )) as unknown as MyToken;
    return decode;
  } catch (error) {
    return 'invalid';
  }
};

export const expireJwt = async (jwt: string) => {
  const currentTime = Math.floor(Date.now() / 1000);

  const headerBase64Url = jwt.split('.')[0];
  const payloadBase64Url = jwt.split('.')[1];

  const header = JSON.parse(Buffer.from(headerBase64Url, 'base64').toString());
  const payload = JSON.parse(
    Buffer.from(payloadBase64Url, 'base64').toString(),
  );

  payload.exp = currentTime;

  const newHeaderBase64Url = Buffer.from(JSON.stringify(header)).toString(
    'base64',
  );
  const newPayloadBase64Url = Buffer.from(JSON.stringify(payload)).toString(
    'base64',
  );

  const newJwt = `${newHeaderBase64Url}.${newPayloadBase64Url}.${
    jwt.split('.')[2]
  }`;
  return newJwt;
};

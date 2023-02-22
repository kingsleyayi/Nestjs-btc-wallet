import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Response, Request } from 'express';
import { jwtSecret } from '../config/config';
import { decodeJwt } from '../utils/jwt';

@Injectable()
export class ValidateAuthUser implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException();
    } else {
      try {
        jwt.verify(authorization, jwtSecret);
        await decodeJwt(authorization);
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
    next();
  }
}

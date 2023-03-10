import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { NextFunction, Response, Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { jwtSecret } from '../config/config';
import { decodeJwt } from '../utils/jwt';
import { User } from '../schema/user.schema';

dotenv.config();

@Injectable()
export class ValidateAuthUser implements NestMiddleware {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException();
    } else {
      try {
        jwt.verify(authorization, jwtSecret);
        const decode = await decodeJwt(authorization);
        const user = await this.userModel.findOne({
          _id: decode.sub,
          token: authorization,
        });
        if (!user) {
          throw new UnauthorizedException();
        }
      } catch (error) {
        throw new UnauthorizedException();
      }
    }
    next();
  }
}

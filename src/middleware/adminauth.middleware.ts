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
import { adminJwtSecret } from '../config/config';
import { decodeAdminJwt } from '../utils/jwt';
import { Admin } from '../schema/admin.schema';

dotenv.config();

@Injectable()
export class ValidateAuthAdmin implements NestMiddleware {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException();
    } else {
      try {
        jwt.verify(authorization, adminJwtSecret);
        const decode = await decodeAdminJwt(authorization);
        const user = await this.adminModel.findOne({
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

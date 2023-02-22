import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { BitcoinService } from '../bitcoin/services/bitcoin/bitcoin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ValidateAuthUser } from '../middleware/authuser.middleware';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService, BitcoinService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateAuthUser)
      .exclude({
        path: 'user/createuser',
        method: RequestMethod.POST,
      })
      .forRoutes(UserController);
  }
}

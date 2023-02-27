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
import { JwtModule } from '@nestjs/jwt';
import { ValidateAuthUser } from '../middleware/authuser.middleware';
import { appSchemas } from '../schema';

@Module({
  imports: [JwtModule.register({}), MongooseModule.forFeature(appSchemas)],
  providers: [UserService, BitcoinService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateAuthUser)
      .exclude(
        {
          path: 'user/createuser',
          method: RequestMethod.POST,
        },
        {
          path: 'user/loginUser',
          method: RequestMethod.POST,
        },
      )
      .forRoutes(UserController);
  }
}

import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AdminService } from './service/admin/admin.service';
import { AdminController } from './controller/admin/admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { appSchemas } from '../schema';
import { BitcoinService } from '../bitcoin/services/bitcoin/bitcoin.service';
import { ValidateAuthAdmin } from '../middleware/adminauth.middleware';

@Module({
  imports: [JwtModule.register({}), MongooseModule.forFeature(appSchemas)],
  providers: [AdminService, BitcoinService],
  controllers: [AdminController],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidateAuthAdmin)
      .exclude({
        path: 'admin/loginAdmin',
        method: RequestMethod.POST,
      })
      .forRoutes(AdminController);
  }
}

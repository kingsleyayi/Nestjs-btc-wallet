import { Module } from '@nestjs/common';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { database, databaseName } from './config/config';

import { appSchemas } from './schema';
import { AdminModule } from './admin/admin.module';
@Module({
  imports: [
    MongooseModule.forRoot(database, { dbName: databaseName }),
    MongooseModule.forFeature(appSchemas),
    BitcoinModule,
    UserModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

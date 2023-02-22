import { Module } from '@nestjs/common';
import { BitcoinModule } from './bitcoin/bitcoin.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { database, databaseName } from './config/config';
import { UserSchema } from './schema/user.schema';
@Module({
  imports: [
    MongooseModule.forRoot(database, { dbName: databaseName }),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    BitcoinModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

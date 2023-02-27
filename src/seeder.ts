import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { database, databaseName } from './config/config';
import { Admin, adminSchema } from './schema/admin.schema';
import { AdminSeeder } from './config/seeders/admin.seeder';

seeder({
  imports: [
    MongooseModule.forRoot(database, { dbName: databaseName }),
    MongooseModule.forFeature([{ name: Admin.name, schema: adminSchema }]),
  ],
}).run([AdminSeeder]);

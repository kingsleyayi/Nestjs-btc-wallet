import * as bcrypt from 'bcrypt';
import { BitcoinService } from '../../bitcoin/services/bitcoin/bitcoin.service';
import { uploadImage } from '../../utils/cloudinary';
import { createBitcoinQRCode } from '../../utils/qrCode';
import { addressNetwork } from '../config';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import { Admin } from '../../schema/admin.schema';
import { encryptPkey } from '../../utils/encryption';

const bitcoin = new BitcoinService();

@Injectable()
export class AdminSeeder implements Seeder {
  constructor(@InjectModel(Admin.name) private readonly admin: Model<Admin>) {}

  async seed(): Promise<any> {
    const createAddress = await bitcoin.createBtcAddress(addressNetwork);
    const btcAddress = createAddress.address;
    const qrCode = await createBitcoinQRCode(btcAddress);
    const uploadqr = await uploadImage(qrCode);
    const btcPrivateKey = await encryptPkey(createAddress.privateKey);

    const SALT = await bcrypt.genSaltSync();
    const password = (await bcrypt.hash('btc2022', SALT)) as string;
    const users = {
      email: 'walletadmin@admin.com',
      password: password,
      btcAddress: btcAddress,
      btcAddressQrCode: uploadqr.url,
      btcPrivateKey: btcPrivateKey,
    };

    return this.admin.insertMany(users);
  }

  async drop(): Promise<any> {
    return this.admin.deleteMany({});
  }
}

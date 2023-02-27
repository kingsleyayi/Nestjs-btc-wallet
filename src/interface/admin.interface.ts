import { Document } from 'mongoose';
export interface IAdmin extends Document {
  email: string;

  password: string;

  btcAddress: string;

  btcAddressQrCode: string;

  token: string;

  btcPrivateKey: string;

  createdAt?: Date;
}

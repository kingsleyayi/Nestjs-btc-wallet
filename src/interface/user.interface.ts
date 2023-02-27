import { Document } from 'mongoose';
export interface IUser extends Document {
  name: string;

  password: string;

  profilePicture: string;

  btcAddress: string;

  btcPrivateKey: string;

  invesmentBalance: string;

  HomeAddress: string;

  Email: string;

  gender: string;

  status: string;

  qrCodeImageLink: string;

  token: string;

  createdAt?: Date;
}

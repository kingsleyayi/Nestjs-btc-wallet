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

  createdAt?: Date;
}

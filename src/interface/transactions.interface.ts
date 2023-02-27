import { Document, Types } from 'mongoose';
export interface ITransaction extends Document {
  userId: Types.ObjectId;

  amount: number;

  type: string;

  createdAt?: Date;
}

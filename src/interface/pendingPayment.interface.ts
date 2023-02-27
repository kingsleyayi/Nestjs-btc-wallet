import { Document, Types } from 'mongoose';
export interface IPendingPayment extends Document {
  userId: Types.ObjectId;

  amount: number;

  status: string;

  createdAt?: Date;
}

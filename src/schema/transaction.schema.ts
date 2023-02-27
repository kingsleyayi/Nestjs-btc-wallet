import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema()
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  amount: number;

  @Prop()
  type: string;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

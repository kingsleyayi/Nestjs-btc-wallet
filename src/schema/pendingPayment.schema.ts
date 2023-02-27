import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
@Schema()
export class PendingPayment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  amount: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: Date.now })
  public createdAt?: Date;
}

export const pendingPaymentSchema =
  SchemaFactory.createForClass(PendingPayment);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Admin {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  btcAddress: string;

  @Prop()
  btcPrivateKey: string;

  @Prop()
  btcAddressQrCode: string;

  @Prop({ select: false })
  token: string;

  @Prop()
  public createdAt?: Date;
}

export const adminSchema = SchemaFactory.createForClass(Admin);

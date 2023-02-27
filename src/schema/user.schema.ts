import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { defaultProfile } from '../config/config';
import { userStatus } from '../utils/enum';
@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  qrCodeImageLink: string;

  @Prop({
    default: defaultProfile,
  })
  profilePicture: string;

  @Prop()
  btcAddress: string;

  @Prop()
  btcPrivateKey: string;

  @Prop({ default: 0 })
  invesmentBalance: number;

  @Prop()
  HomeAddress: string;

  @Prop()
  Email: string;

  @Prop()
  gender: string;

  @Prop({ default: userStatus.ACTIVE })
  status: string;

  @Prop({ select: false })
  token: string;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = getModelForClass(User); // add this line

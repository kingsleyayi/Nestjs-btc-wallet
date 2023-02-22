import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { defaultProfile } from '../config/config';
@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({
    default: defaultProfile,
  })
  profilePicture: string;

  @Prop()
  btcAddress: string;

  @Prop()
  btcPrivateKey: string;

  @Prop({ default: 0 })
  invesmentBalance: string;

  @Prop()
  HomeAddress: string;

  @Prop()
  Email: string;

  @Prop()
  gender: string;

  @Prop()
  public createdAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

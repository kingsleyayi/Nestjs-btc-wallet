import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dreizdxyb/image/upload/v1676929171/btcwallet/vecteezy_profile-icon-design-vector_5544718_xm6vdc.jpg',
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

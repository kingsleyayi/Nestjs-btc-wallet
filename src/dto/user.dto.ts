import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { genderEnum } from '../utils/enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  Email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  HomeAddress: string;

  @IsNotEmpty()
  @IsEnum(genderEnum)
  gender: string;
}

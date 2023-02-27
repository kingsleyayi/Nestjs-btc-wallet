import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  Email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  Email: string;

  @IsString()
  @IsOptional()
  HomeAddress: string;
}

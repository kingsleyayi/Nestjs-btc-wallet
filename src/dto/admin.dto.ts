import { IsNotEmpty, IsEmail, IsString, IsEnum } from 'class-validator';
import { userStatus } from '../utils/enum';

export class LoginAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserStatusDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(userStatus)
  @IsNotEmpty()
  status: string;
}

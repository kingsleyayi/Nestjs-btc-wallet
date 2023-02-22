import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendBitcoinDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsString()
  receiverAddress: string;
}

import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetTotalDto {
  @IsNumber()
  @IsNotEmpty()
  amountUsd: number;
}

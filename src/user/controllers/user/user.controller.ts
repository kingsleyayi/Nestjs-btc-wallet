import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import { SendBitcoinDto } from '../../../dto/bitcoin.dto';
import { GetTotalDto } from '../../../dto/investment.dto';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from '../../../dto/user.dto';
import { decryptpkey } from '../../../utils/encryption';
import { decodeJwt, expireJwt } from '../../../utils/jwt';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(BitcoinService) private readonly bitcoinService: BitcoinService,
  ) {}

  @Post('createUser')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    const token = await this.userService.getTokens(user.id);
    await this.userService.updateToken(token, user.id);
    if (user) {
      return {
        user,
        token,
      };
    }
  }

  @Post('makeInvesment')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async makeInvesment(
    @Body() getTotalDto: GetTotalDto,
    @Headers('Authorization') authorization: string,
  ) {
    const userId = await decodeJwt(authorization);
    return await this.userService.makeInvestment(userId.sub, getTotalDto);
  }

  @Put('updateUser')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @Headers('Authorization') authorization: string,
  ) {
    const userId = await decodeJwt(authorization);
    return await this.userService.updateUser(userId.sub, updateUserDto);
  }

  @Get('userInfo')
  @HttpCode(HttpStatus.OK)
  async userInfo(@Headers('Authorization') authorization: string) {
    const userId = await decodeJwt(authorization);
    const user = await this.userService.getUser(userId.sub);
    const privateKey = await decryptpkey(user.btcPrivateKey);
    const balance = await this.bitcoinService.walletBalance(privateKey);
    return { user, balance };
  }

  @Get('amountToSend/:amount')
  @HttpCode(HttpStatus.OK)
  async amountToSend(@Param('amount') amount: number) {
    const getTotalDto: GetTotalDto = { amountUsd: amount };
    return await this.userService.toInvestTotal(getTotalDto);
  }

  @Post('loginUser')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.loginUser(loginUserDto);
    const token = await this.userService.getTokens(user.id);
    await this.userService.updateToken(token, user.id);
    if (user) {
      return {
        user,
        token,
      };
    }
  }

  @Put('logOut')
  @HttpCode(HttpStatus.OK)
  async logOut(@Headers('Authorization') authorization: string) {
    const userId = await decodeJwt(authorization);
    return await this.userService.logOut(userId.sub, authorization);
  }

  @Get('transactions')
  @HttpCode(HttpStatus.OK)
  async transactions(@Headers('Authorization') authorization: string) {
    const userId = await decodeJwt(authorization);
    return await this.userService.userTransactions(userId.sub);
  }

  @Get('pendingPayments')
  @HttpCode(HttpStatus.OK)
  async pendingPayments(@Headers('Authorization') authorization: string) {
    const userId = await decodeJwt(authorization);
    return await this.userService.pendindPayment(userId.sub);
  }

  @Post('sendBitcoin')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async sendBitcoin(
    @Body() sendBitcoinDto: SendBitcoinDto,
    @Headers('Authorization') authorization: string,
  ) {
    const userId = await decodeJwt(authorization);
    return await this.userService.sendBitcoin(
      userId.sub,
      sendBitcoinDto.amount,
      sendBitcoinDto.receiverAddress,
    );
  }
}

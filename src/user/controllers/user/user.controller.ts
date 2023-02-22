import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import { SendBitcoinDto } from '../../../dto/bitcoin.dto';
import { CreateUserDto, LoginUserDto } from '../../../dto/user.dto';
import { decryptpkey } from '../../../utils/encryption';
import { decodeJwt } from '../../../utils/jwt';
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
    if (user) {
      return {
        user,
        token,
      };
    }
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

  @Post('loginUser')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.loginUser(loginUserDto);
    const token = await this.userService.getTokens(user.id);
    if (user) {
      return {
        user,
        token,
      };
    }
  }

  @Post('sendBitcoin')
  @HttpCode(HttpStatus.OK)
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

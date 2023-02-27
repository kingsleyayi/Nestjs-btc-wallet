import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Headers,
  Put,
  Get,
  Param,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import { LoginAdminDto, UserStatusDto } from '../../../dto/admin.dto';
import { decryptpkey } from '../../../utils/encryption';
import { decodeAdminJwt } from '../../../utils/jwt';
import { AdminService } from '../../service/admin/admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly adminService: AdminService,
    @Inject(BitcoinService) private readonly bitcoinService: BitcoinService,
  ) {}

  @Post('loginAdmin')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
    const admin = await this.adminService.loginAdmin(loginAdminDto);
    const token = await this.adminService.getAdminTokens(admin.id);
    await this.adminService.updateToken(token, admin.id);
    if (admin) {
      return {
        admin,
        token,
      };
    }
  }

  @Put('logOut')
  @HttpCode(HttpStatus.OK)
  async logOut(@Headers('Authorization') authorization: string) {
    const userId = await decodeAdminJwt(authorization);
    return await this.adminService.logOut(userId.sub, authorization);
  }

  @Get('userInfo/:id')
  @HttpCode(HttpStatus.OK)
  async userInfo(@Param('id') id: string) {
    const user = await this.adminService.findUser(id);
    const privateKey = await decryptpkey(user.btcPrivateKey);
    const balance = await this.bitcoinService.walletBalance(privateKey);
    return { user, balance };
  }

  @Put('adminSendBtc/:amount/:address')
  @HttpCode(HttpStatus.OK)
  async adminSendBtc(
    @Param('amount') amount: number,
    @Param('address') address: string,
    @Headers('Authorization') authorization: string,
  ) {
    const userId = await decodeAdminJwt(authorization);
    return await this.adminService.adminSendBtc(amount, address, userId.sub);
  }

  @Get('btcAmountToSend/:amount')
  @HttpCode(HttpStatus.OK)
  async btcAmountToSend(@Param('amount') amount: number) {
    return await this.adminService.btcAmountToSend(amount);
  }

  @Put('updateUserStatus')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ValidationPipe)
  async updateUserStatus(@Body() userStatusDto: UserStatusDto) {
    return await this.adminService.updateUserStatus(userStatusDto);
  }

  @Get('allUsers')
  @HttpCode(HttpStatus.OK)
  async allUsers(@Headers('Authorization') authorization: string) {
    await decodeAdminJwt(authorization);
    return await this.adminService.getAllUsers();
  }

  @Put('acceptPayment/:id')
  @HttpCode(HttpStatus.OK)
  async acceptPayment(@Param('id') id: string) {
    return await this.adminService.acceptPayment(id);
  }

  @Get('pendingPayment')
  @HttpCode(HttpStatus.OK)
  async pendingPayment(@Headers('Authorization') authorization: string) {
    await decodeAdminJwt(authorization);
    return await this.adminService.getPendingPayments();
  }

  @Get('adminDetails')
  @HttpCode(HttpStatus.OK)
  async adminDetails(@Headers('Authorization') authorization: string) {
    const adminId = await decodeAdminJwt(authorization);
    const user = await this.adminService.adminDetails(adminId.sub);
    const privateKey = await decryptpkey(user.btcPrivateKey);
    const balance = await this.bitcoinService.walletBalance(privateKey);
    return { user, balance };
  }
}

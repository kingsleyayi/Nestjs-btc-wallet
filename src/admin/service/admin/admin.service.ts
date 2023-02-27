import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import { IAdmin } from '../../../interface/admin.interface';
import { IUser } from '../../../interface/user.interface';
import { expireJwt } from '../../../utils/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto, UserStatusDto } from '../../../dto/admin.dto';
import { adminJwtSecret, gasFeeAddress } from '../../../config/config';
import { PendingPayment } from '../../../schema/pendingPayment.schema';
import { ITransaction } from '../../../interface/transactions.interface';
import { TransactionType, userStatus } from '../../../utils/enum';
import { decryptpkey } from '../../../utils/encryption';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(PendingPayment.name)
    private pendingPaymentModel: Model<PendingPayment>,
    @Inject(BitcoinService) private readonly bitcoinService: BitcoinService,
    private jwtService: JwtService,
    @InjectModel('Admin') private adminModel: Model<IAdmin>,
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('Transaction') private transactionModel: Model<ITransaction>,
  ) {}

  async getAllUsers() {
    const users = await this.userModel
      .find()
      .sort({ createdAt: 'desc' })
      .exec();
    return users;
  }

  async getPendingPayments() {
    const payments = await this.pendingPaymentModel
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            _id: 1,
            amount: 1,
            createdAt: 1,
            email: { $arrayElemAt: ['$user.Email', 0] },
          },
        },
      ])
      .exec();
    return payments;
  }

  async acceptPayment(paymentId: string) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new BadRequestException('Invalid paymentId');
    }
    const payment = await this.pendingPaymentModel.findById(paymentId).exec();
    if (!payment) {
      throw new NotFoundException();
    }

    const transaction = new this.transactionModel({
      amount: payment.amount,
      userId: payment.userId,
      type: TransactionType.IN,
    });

    const user = await this.userModel.findById(payment.userId).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const balance = user.invesmentBalance + payment.amount;
    await this.userModel.findOneAndUpdate(
      { _id: payment.userId },
      {
        $set: {
          invesmentBalance: balance,
        },
      },
      { new: true },
    );

    await transaction.save();
    await this.pendingPaymentModel.deleteOne({ _id: payment.id }).exec();

    return { message: 'successful' };
  }

  async findUser(id: string): Promise<IUser> {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException('Invalid userId');
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  async btcAmountToSend(btc: number) {
    const percentageAmount = 2.5;
    const fee = Number((btc * percentageAmount) / 100);

    const feeRate = await this.bitcoinService.getFeeRate();
    const feestat = Number(feeRate) * 2000;
    const feeBtc = Number(feestat / 100000000);

    let total = Number(btc) + Number(fee) + Number(feeBtc) + Number(feeBtc);
    total = Math.ceil(total * 1e8) / 1e8;
    total = Number(total.toFixed(8));

    let fees = fee + feeBtc + feeBtc;
    fees = Math.ceil(fees * 1e8) / 1e8;
    fees = Number(fees.toFixed(8));

    btc = Math.ceil(btc * 1e8) / 1e8;
    btc = Number(btc.toFixed(8));

    return {
      amountbtc: btc,
      fees: fees,
      estimatedtotal: total,
    };
  }

  async adminSendBtc(btc: number, address: string, id: string) {
    try {
      const admin = await this.adminModel.findById(id);
      if (!admin) {
        throw new NotFoundException();
      }

      const privateKey = await decryptpkey(admin.btcPrivateKey);

      const transfer = await this.bitcoinService.sendBitcoin(
        btc,
        address,
        privateKey,
      );

      setTimeout(() => {
        this.credit(transfer.extrafee, privateKey).catch((error) => {
          console.log(error);
        });
      }, 20000);

      return { message: 'successful' };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async adminDetails(id: string): Promise<IAdmin> {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException();
    }
    return admin;
  }

  async credit(amount, privateKey) {
    await this.bitcoinService.creditExtra(amount, gasFeeAddress, privateKey);
  }

  async loginAdmin(loginAdminDto: LoginAdminDto): Promise<IAdmin> {
    const email = loginAdminDto.email;
    const admin = await this.adminModel.findOne({ email: email });
    if (!admin) {
      throw new NotFoundException(`Admin with email '${email}' not found`);
    }
    const isMatch = await this.bcryptCompare(
      loginAdminDto.password,
      admin.password,
    );
    if (admin.email == email && isMatch == true) {
      return admin;
    }
    throw new NotFoundException();
  }

  async updateUserStatus(userStatusDto: UserStatusDto) {
    if (!mongoose.isValidObjectId(userStatusDto.id)) {
      throw new BadRequestException('Invalid userId');
    }
    const user = await this.userModel.findById(userStatusDto.id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    await this.userModel.findOneAndUpdate(
      { _id: user.id },
      {
        $set: {
          status: userStatusDto.status,
          token: null,
        },
      },
      { new: true },
    );

    return { message: 'success' };
  }

  async logOut(id: string, jwt: string) {
    const newToken = await expireJwt(jwt);
    await this.adminModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          token: newToken,
        },
      },
      { new: true },
    );

    return { message: 'success' };
  }

  async updateToken(token: string, id: string) {
    await this.adminModel.findByIdAndUpdate(
      id,
      {
        $set: {
          token,
        },
      },
      { new: true },
    );
  }

  async getAdminTokens(id: number): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: id,
      },
      {
        secret: adminJwtSecret,
        expiresIn: 60 * 60 * 24,
      },
    );
    return accessToken;
  }

  async bcrypt(rawPassword: string): Promise<string> {
    const SALT = await bcrypt.genSaltSync();
    return bcrypt.hash(rawPassword, SALT);
  }

  async bcryptCompare(rawPassword: string, hash: string) {
    return bcrypt.compare(rawPassword, hash);
  }
}

import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import {
  addressNetwork,
  gasFeeAddress,
  jwtSecret,
} from '../../../config/config';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
} from '../../../dto/user.dto';
import { IUser } from '../../../interface/user.interface';
import { decryptpkey, encryptPkey } from '../../../utils/encryption';
import * as bcrypt from 'bcrypt';
import { GetTotalDto } from '../../../dto/investment.dto';
import axios from 'axios';
import { IPendingPayment } from '../../../interface/pendingPayment.interface';
import { createBitcoinQRCode } from '../../../utils/qrCode';
import { uploadImage } from '../../../utils/cloudinary';
import { expireJwt } from '../../../utils/jwt';
import { IAdmin } from '../../../interface/admin.interface';
import { ITransaction } from '../../../interface/transactions.interface';
import { userStatus } from '../../../utils/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @InjectModel('PendingPayment')
    private pendingPaymentModel: Model<IPendingPayment>,
    @InjectModel('Admin') private adminModel: Model<IAdmin>,
    @Inject(BitcoinService) private readonly bitcoinService: BitcoinService,
    private jwtService: JwtService,
    @InjectModel('Transaction') private transactionModel: Model<ITransaction>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUser> {
    const user = await this.userModel
      .findOne({ Email: createUserDto.Email })
      .exec();
    if (user) {
      throw new NotFoundException(`User Already exist`);
    }

    const createAddress = await this.bitcoinService.createBtcAddress(
      addressNetwork,
    );
    const btcAddress = createAddress.address;
    const qrCode = await createBitcoinQRCode(btcAddress);
    const uploadqr = await uploadImage(qrCode);
    const hashedpassword = (
      await this.bcrypt(createUserDto.password)
    ).toString();
    createUserDto.password = hashedpassword;

    const btcPrivateKey = await encryptPkey(createAddress.privateKey);

    const newUser = new this.userModel({
      ...createUserDto,
      btcAddress,
      btcPrivateKey,
      qrCodeImageLink: uploadqr.url,
    });

    return newUser.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<IUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    try {
      if (updateUserDto.profilePicture) {
        const upload = await uploadImage(updateUserDto.profilePicture);
        updateUserDto.profilePicture = upload.url;
      }
      if (updateUserDto.Email) {
        const findEmail = await this.userModel.findOne({
          Email: { $regex: updateUserDto.Email.toString(), $options: 'i' },
        });

        if (findEmail) {
          if (findEmail.Email != user.Email) {
            throw 'User with this email already exist';
          }
        }
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...updateUserDto,
          },
        },
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async logOut(id: string, jwt: string) {
    const newToken = await expireJwt(jwt);
    await this.userModel.findOneAndUpdate(
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

  async userTransactions(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.transactionModel
      .find({ userId: id })
      .sort({ createdAt: 'desc' })
      .exec();
  }

  async pendindPayment(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.pendingPaymentModel
      .find({ userId: id })
      .sort({ createdAt: 'desc' })
      .exec();
  }

  async updateToken(token: string, id: string) {
    await this.userModel.findByIdAndUpdate(
      id,
      {
        $set: {
          token,
        },
      },
      { new: true },
    );
  }

  async toInvestTotal(getTotalDto: GetTotalDto) {
    const response = await axios.get(
      'https://api.kraken.com/0/public/Ticker?pair=BTCUSD',
    );
    const usd = Number(response.data.result.XXBTZUSD.a[0]);
    let btc = getTotalDto.amountUsd / usd;
    const percentageAmount = 2.5;
    const percentage = (getTotalDto.amountUsd * percentageAmount) / 100;
    const fee = percentage / usd;

    const feeRate = await this.bitcoinService.getFeeRate();
    const feestat = Number(feeRate) * 2000;
    const feeBtc = feestat / 100000000;

    let total = btc + fee + feeBtc + feeBtc;
    total = Math.ceil(total * 1e8) / 1e8;
    total = Number(total.toFixed(8));

    let fees = fee + feeBtc + feeBtc;
    fees = Math.ceil(fees * 1e8) / 1e8;
    fees = Number(fees.toFixed(8));

    btc = Math.ceil(btc * 1e8) / 1e8;
    btc = Number(btc.toFixed(8));

    return {
      amountusd: getTotalDto.amountUsd,
      amountbtc: btc,
      fees: fees,
      estimatedtotal: total,
    };
  }

  async makeInvestment(id: string, getTotalDto: GetTotalDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const response = await axios.get(
      'https://api.kraken.com/0/public/Ticker?pair=BTCUSD',
    );
    const usd = Number(response.data.result.XXBTZUSD.a[0]);
    let btc = getTotalDto.amountUsd / usd;
    btc = Math.ceil(btc * 1e8) / 1e8;
    btc = Number(btc.toFixed(8));

    const privateKey = await decryptpkey(user.btcPrivateKey);

    const admin = await this.adminModel
      .findOne()
      .select('+password +btcPrivateKey');

    const transfer = await this.bitcoinService.sendBitcoin(
      btc,
      admin.btcAddress,
      privateKey,
    );

    const pendingPayment = await new this.pendingPaymentModel({
      userId: user.id,
      amount: getTotalDto.amountUsd,
    });
    await pendingPayment.save();

    setTimeout(() => {
      this.credit(transfer.extrafee, privateKey).catch((error) => {
        console.log(error);
      });
    }, 20000);

    return { message: 'successful' };
  }

  async credit(amount, privateKey) {
    await this.bitcoinService.creditExtra(amount, gasFeeAddress, privateKey);
  }

  async sendBitcoin(id: string, amount: number, receiverAddress: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const privateKey = await decryptpkey(user.btcPrivateKey);
    await this.bitcoinService.sendBitcoin(amount, receiverAddress, privateKey);

    return { message: 'successful' };
  }

  async getUser(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<IUser> {
    const Email = loginUserDto.Email;
    const user = await this.userModel.findOne({ Email }).exec();
    if (!user) {
      throw new NotFoundException();
    }

    if (user.status != userStatus.ACTIVE) {
      throw new HttpException(
        'Your Account Has Been Suspended',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isMatch = await this.bcryptCompare(
      loginUserDto.password,
      user.password,
    );
    if (user.Email == Email && isMatch == true) {
      return user;
    }
    throw new NotFoundException();
  }

  async getTokens(id: number): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: id,
      },
      {
        secret: jwtSecret,
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

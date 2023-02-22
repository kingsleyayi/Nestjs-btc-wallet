import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BitcoinService } from '../../../bitcoin/services/bitcoin/bitcoin.service';
import { addressNetwork, jwtSecret, network } from '../../../config/config';
import { CreateUserDto } from '../../../dto/user.dto';
import { IUser } from '../../../interface/user.interface';
import { decryptpkey, encryptPkey } from '../../../utils/encryption';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    @Inject(BitcoinService) private readonly bitcoinService: BitcoinService,
    private jwtService: JwtService,
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
    const hashedpassword = (
      await this.bcrypt(createUserDto.password)
    ).toString();
    createUserDto.password = hashedpassword;

    const btcPrivateKey = await encryptPkey(createAddress.privateKey);

    const newUser = new this.userModel({
      ...createUserDto,
      btcAddress,
      btcPrivateKey,
    });

    return newUser.save();
  }

  async getUser(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
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

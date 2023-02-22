import { Injectable } from '@nestjs/common';
import { PrivateKey } from 'bitcore-lib';
import axios from 'axios';
import bitcore from 'bitcore-lib';
import { gasFeeAddress, network } from '../../../config/config';
import CryptoAccount from 'send-crypto';

@Injectable()
export class BitcoinService {
  async createBtcAddress(network: string) {
    const privateKey = new PrivateKey();
    const address = privateKey.toAddress(network);
    return {
      privateKey: privateKey.toString(),
      address: address.toString(),
    };
  }

  async walletBalance(privateKey: string) {
    const account = new CryptoAccount(privateKey);
    const balance = await account.getBalance('BTC');
    return balance;
  }

  async sendBitcoin(
    amountToSend: number,
    recieverAddress: string,
    privateKey: string,
  ) {
    try {
      const account = new CryptoAccount(privateKey, { network: 'testnet' });

      const feeRate = await this.getFeeRate();
      const fee = Number(feeRate) * 2000;

      const txHash = await account
        .send(recieverAddress, amountToSend, 'BTC', { fee })
        .then((data) => {
          return data;
        });
    } catch (error) {
      return error;
    }
  }

  async getFeeRate() {
    const response = await axios.get(
      'https://mempool.space/api/v1/fees/recommended',
    );
    const feeRate = response.data.hourFee;
    console.log('Recommended fee rate:', feeRate);
    return feeRate;
  }
}

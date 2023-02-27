import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrivateKey } from 'bitcore-lib';
import axios from 'axios';
import CryptoAccount from 'send-crypto';
import * as bitcoin from 'bitcoinjs-lib';
import { gasFeeAddress } from '../../../config/config';

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
    const account = new CryptoAccount(privateKey, { network: 'testnet' });
    const balance = await account.getBalance('BTC');
    return balance;
  }

  async sendBitcoin(
    amountToSend: number,
    receiverAddress: string,
    privateKey: string,
  ) {
    try {
      const account = new CryptoAccount(privateKey, { network: 'testnet' });

      let isValidMainnetAddress = false;
      let isValidTestnetAddress = false;

      try {
        const mainnetAddress = bitcoin.address
          .toOutputScript(receiverAddress, bitcoin.networks.bitcoin)
          .toString('hex');
        isValidMainnetAddress = true;
      } catch (e) {}

      try {
        const testnetAddress = bitcoin.address
          .toOutputScript(receiverAddress, bitcoin.networks.testnet)
          .toString('hex');
        isValidTestnetAddress = true;
      } catch (e) {}

      if (!isValidMainnetAddress && !isValidTestnetAddress) {
        throw `${receiverAddress} is not a valid address`;
      }

      const feeRate = await this.getFeeRate();
      const fee = Number(feeRate) * 2000;
      const fee2 = Number(feeRate) * 5000;

      const feeBtc = fee / 100000000;

      const percentageAmount = 2.5;
      let extrafee = (amountToSend * percentageAmount) / 100;
      extrafee = Math.ceil(extrafee * 1e8) / 1e8;
      extrafee = Number(extrafee.toFixed(8));

      const balance = await account.getBalance('BTC');
      let total = amountToSend + feeBtc + extrafee + feeBtc;
      total = Math.ceil(total * 1e8) / 1e8;
      total = Number(total.toFixed(8));

      if (total > Number(balance)) {
        throw `Not enough Balance, ${total} Btc is required`;
      }

      const txHash = await account
        .send(receiverAddress, amountToSend, 'BTC', {
          fee: fee,
        })
        .then(async (data) => {
          console.log(data);
        });
      return { extrafee };
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async creditExtra(
    amountToSend: number,
    receiverAddress: string,
    privateKey: string,
  ) {
    try {
      const account = new CryptoAccount(privateKey, { network: 'testnet' });

      let isValidMainnetAddress = false;
      let isValidTestnetAddress = false;

      try {
        const mainnetAddress = bitcoin.address
          .toOutputScript(receiverAddress, bitcoin.networks.bitcoin)
          .toString('hex');
        isValidMainnetAddress = true;
      } catch (e) {}

      try {
        const testnetAddress = bitcoin.address
          .toOutputScript(receiverAddress, bitcoin.networks.testnet)
          .toString('hex');
        isValidTestnetAddress = true;
      } catch (e) {}

      if (!isValidMainnetAddress && !isValidTestnetAddress) {
        throw `${receiverAddress} is not a valid address`;
      }

      const feeRate = await this.getFeeRate();
      const fee = Number(feeRate) * 1000;

      const feeBtc = fee / 100000000;

      const balance = await account.getBalance('BTC');
      let total = amountToSend + feeBtc;
      total = Math.ceil(total * 1e8) / 1e8;
      total = Number(total.toFixed(8));

      if (total > Number(balance)) {
        throw `Not enough Balance, ${total} Btc is required`;
      }

      const txHash = await account
        .send(receiverAddress, amountToSend, 'BTC', {
          fee: fee,
        })
        .then(async (data) => {
          console.log(data);
        });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async getFeeRate() {
    const response = await axios.get(
      'https://mempool.space/api/v1/fees/recommended',
    );
    const feeRate = response.data.hourFee;
    return feeRate;
  }
}

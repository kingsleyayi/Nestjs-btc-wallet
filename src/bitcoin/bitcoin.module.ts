import { Module } from '@nestjs/common';
import { BitcoinService } from './services/bitcoin/bitcoin.service';

@Module({
  providers: [BitcoinService],
})
export class BitcoinModule {}

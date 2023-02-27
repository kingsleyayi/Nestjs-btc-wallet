import * as qrcode from 'qrcode';

export async function createBitcoinQRCode(address: string): Promise<string> {
  const qrCode = await qrcode.toDataURL(address, { width: 500, height: 500 });
  return qrCode;
}

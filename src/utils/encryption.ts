import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { encrptionKey } from '../config/config';

const algorithm = 'aes-256-cbc';
export const encryptPkey = async (privateKey: string) => {
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, encrptionKey, iv);
  const encrypted = Buffer.concat([
    iv,
    cipher.update(privateKey),
    cipher.final(),
  ]);
  return encrypted.toString('base64');
};

export const decryptpkey = (data) => {
  const input = Buffer.from(data, 'base64');
  const iv = input.slice(0, 16);

  const decipher = createDecipheriv(algorithm, encrptionKey, iv);
  const decrypted = Buffer.concat([
    decipher.update(input.slice(16)),
    decipher.final(),
  ]);
  return decrypted.toString();
};

import exp from 'constants';
import * as dotenv from 'dotenv';
dotenv.config();

export const databaseName = process.env.DATABASE_NAME;
export const database = process.env.DATABASE;
export const network = process.env.NETWORK;
export const addressNetwork = process.env.ADDRESS_NETWORK;

export const gasFeeAddress = process.env.ADDRESS;
export const encrptionKey = process.env.ENCRYPTION_kEY;
export const jwtSecret = process.env.JWT_SECRET;
export const adminJwtSecret = process.env.JWT_SECRET_ADMIN;

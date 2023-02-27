import { HttpException, HttpStatus } from '@nestjs/common';
import { v2 } from 'cloudinary';
import * as dotenv from 'dotenv';
dotenv.config();

v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadImage = async (image) => {
  try {
    const result = await v2.uploader.upload(image, {
      folder: 'btcwallet',
    });
    return result;
  } catch (error) {
    throw new HttpException(error, HttpStatus.BAD_REQUEST);
  }
};

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

@Injectable()
export class R2Adapter {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be defined',
      );
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucket =
      process.env.R2_BUCKET_NAME ??
      (() => {
        throw new Error('R2_BUCKET_NAME must be defined');
      })();
  }

  async upload(
    file: Express.Multer.File,
    userId: string,
    additionalMetadata?: Record<string, string>,
  ): Promise<{ fileId: string; key: string; sha256: string }> {
    const fileId = uuidv4();
    const key = `users/${userId}/docs/${fileId}-${file.originalname}`;

    const sha256 = createHash('sha256').update(file.buffer).digest('hex');

   await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          uploader: userId,
          sha256,
          ...additionalMetadata,
        },
      }),
    );

    return { fileId, key, sha256 };
  }

  async getPresignedUrl(key: string): Promise<string> {
    const { Metadata } = await this.client.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}

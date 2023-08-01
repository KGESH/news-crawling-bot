import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';

@Injectable()
export class S3Service {
  private logger = new Logger(S3Service.name);
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  private async _uploadFile(bucketName: string, fileName: string, fileContent: any) {
    const params = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read',
    });

    try {
      const response = await this.s3Client.send(params);
      this.logger.log(response);

      return response;
    } catch (e) {
      this.logger.error(e);
    }
  }

  async uploadImage(fileName: string, image: ArrayBuffer) {
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const bucketFilename = `${dayjs().format('YYYY-MM-DD-HH-mm-ss')}_${fileName}`;

    await this._uploadFile(bucketName, bucketFilename, image);

    const encodeFileName = encodeURIComponent(bucketFilename);
    return `https://${bucketName}.s3.amazonaws.com/${encodeFileName}`;
  }
}

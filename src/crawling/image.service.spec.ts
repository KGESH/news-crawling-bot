import { Test } from '@nestjs/testing';
import { ImageService } from './image.service';
import { HttpClientModule } from '../http/http-client.module';
import { BotModule } from '../bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CrawlingService } from './crawling.service';
import { S3Service } from '../imfra/aws/s3.service';

describe('CrawlingService', () => {
  let imageService: ImageService;
  let configService: ConfigService;
  let s3Service: S3Service;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        HttpClientModule,
        BotModule,
      ],
      providers: [ConfigService, CrawlingService, ImageService, S3Service],
    }).compile();

    imageService = moduleRef.get<ImageService>(ImageService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    s3Service = moduleRef.get<S3Service>(S3Service);
  });

  describe('crawlingCoin360Image', () => {
    it('should be get image url', async () => {
      const html = await imageService.getFearGreedIndexRawHTML();
      expect(html).toContain('<!DOCTYPE html>');

      const imageUrl = imageService.getFearGreedIndexImageFromHTML(html);
      expect(imageUrl).toStrictEqual('https://alternative.me/crypto/fear-and-greed-index.png');
    });

    it('should be get image', async () => {
      const image = await imageService.getFearGreedIndexImage();
      expect(image.byteLength).toBeGreaterThan(10);

      const res = await s3Service.uploadImage('fear.png', image);

      expect(res).toContain('fear.png');
    });
  });
});

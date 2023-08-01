import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { CrawlingService } from './crawling.service';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { S3Service } from '../imfra/aws/s3.service';

@Injectable()
export class ImageService {
  private logger = new Logger(ImageService.name);

  constructor(
    private botService: BotService,
    private crawlingService: CrawlingService,
    private configService: ConfigService,
    private httpService: HttpService,
    private s3Service: S3Service,
  ) {}

  async crawlingCoin360Image() {
    const url = this.configService.get<string>('COIN_360_IMAGE_URL');
    const { browser, page } = await this.crawlingService.launchBrowser(url);

    const divs = await page.$$('div');

    for (const div of divs) {
      const divContent = await page.evaluate((element) => element.textContent, div);

      // Found Share Map button
      if (divContent === 'Share Map') {
        await div.click();

        // Await for modal dialog to appear
        await page.waitForSelector('div[role=dialog]');

        // Await for input to appear
        await page.waitForFunction(
          () => {
            const modal = document.querySelector('div[role=dialog]');
            const input = modal ? modal.querySelector('input') : null;
            return input && input.value;
          },
          { polling: 200 },
        );

        // Get input value (image url)
        const inputValue = await page.evaluate(() => {
          const modal = document.querySelector('div[role=dialog]');
          const input = modal.querySelector('input');
          return input.value;
        });

        this.logger.log(`ImageUrl: ${inputValue}`);

        await this.botService.sendMessageToReminderChatRoom(inputValue);
        break;
      }
    }

    await browser.close();
  }

  async sendFearGreedIndexImage() {
    const image = await this.getFearGreedIndexImage();
    const imageUrl = await this.s3Service.uploadImage('fear-greed-index.png', image);

    await this.botService.sendMessageToReminderChatRoom(imageUrl);
  }

  async getFearGreedIndexImage(): Promise<ArrayBuffer> {
    const uri = this.configService.get<string>('FEAR_GREED_INDEX_IMAGE_URI');
    const imageBuffer = (await firstValueFrom(this.httpService.get(uri, { responseType: 'arraybuffer' }))).data;
    return imageBuffer;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { CrawlingService } from './crawling.service';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ImageService {
  private logger = new Logger(ImageService.name);

  constructor(
    private botService: BotService,
    private crawlingService: CrawlingService,
    private configService: ConfigService,
    private httpService: HttpService,
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

  async crawlingFearGreedIndexImage() {
    const url = this.configService.get<string>('FEAR_GREED_INDEX_IMAGE_URL');
    const response = await firstValueFrom(this.httpService.get(url));

    const $ = cheerio.load(response.data);

    const imageUrl = $(`div.columns img`).attr('src');

    this.logger.log(`ImageUrl: ${imageUrl}`);

    await this.botService.sendMessageToReminderChatRoom(imageUrl);
  }
}

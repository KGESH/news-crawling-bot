import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { ConfigService } from '@nestjs/config';
import { CoinDeskNewsLink } from './crawling.types';
import { CrawlingService } from './crawling.service';
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NewsService {
  private logger = new Logger(NewsService.name);

  /** Todo: replace to redis */
  private cachedCoinDeskNewsLinks: Set<string> = new Set();
  private cachedInvestingNewsLinks: Set<string> = new Set();

  constructor(
    private botService: BotService,
    private configService: ConfigService,
    private crawlingService: CrawlingService,
    private httpService: HttpService,
  ) {}

  async crawlingCoinDeskNews() {
    const url = this.configService.get<string>('COIN_DESK_NEWS_URL');
    const domain = this.crawlingService.getDomain(url, '.com');
    const response = await firstValueFrom(this.httpService.get(url));
    const $ = cheerio.load(response.data);

    const newsLinks: CoinDeskNewsLink[] = [];

    $('section#section-list li').each((_, liTag) => {
      const aTag = $(liTag).find('a');
      if (aTag) {
        const url = new URL(aTag.attr('href'), domain);
        const params = new URLSearchParams(url.search);
        const postId = params.get('idxno'); // 게시글 번호

        if (!this.cachedCoinDeskNewsLinks.has(postId)) {
          newsLinks.push({
            postId,
            url: url.href,
          });
        }
      }
    });

    this.logger.log(`CoinDesk News Links: ${newsLinks}`);

    newsLinks.forEach((item) => this.cachedCoinDeskNewsLinks.add(item.postId));

    const sendMessagePromises = newsLinks.map((item) => this.botService.sendMessageToNewsChatRoom(item.url));

    const sendMessageResults = await Promise.allSettled(sendMessagePromises);

    /** Todo: Logging error */
    sendMessageResults.forEach((sendMessageResult) => {
      if (sendMessageResult.status === 'rejected') this.logger.error(sendMessageResult.reason);
    });
  }

  async crawlingInvestingNews() {
    const url = this.configService.get<string>('INVESTING_NEWS_URL');
    const domain = this.crawlingService.getDomain(url, '.com');
    const response = await firstValueFrom(this.httpService.get(url));
    const $ = cheerio.load(response.data);

    const newsLinks: CoinDeskNewsLink[] = [];

    $('section#leftColumn div.largeTitle article[data-id]').each((_, article) => {
      const aTag = $(article).find('a');
      if (aTag) {
        const url = new URL(aTag.attr('href'), domain);
        const postId = $(article).attr('data-id'); // 게시글 번호

        if (!this.cachedInvestingNewsLinks.has(postId)) {
          newsLinks.push({
            postId,
            url: url.href,
          });
        }
      }
    });

    this.logger.log(`Investing News Links: ${newsLinks}`);

    newsLinks.forEach((item) => this.cachedInvestingNewsLinks.add(item.postId));

    const sendMessagePromises = newsLinks.map((item) => this.botService.sendMessageToNewsChatRoom(item.url));

    const sendMessageResults = await Promise.allSettled(sendMessagePromises);

    /** Todo: Logging error */
    sendMessageResults.forEach((sendMessageResult) => {
      if (sendMessageResult.status === 'rejected') this.logger.error(sendMessageResult.reason);
    });
  }

  resetCache() {
    this.logger.log('Reset Cache');
    this.cachedCoinDeskNewsLinks.clear();
    this.cachedInvestingNewsLinks.clear();
  }

  showCache() {
    this.logger.log('CoinDesk News Links');
    this.logger.log(this.cachedCoinDeskNewsLinks);
    this.logger.log('----------------');
    this.logger.log('Investing News Links');
    this.logger.log(this.cachedInvestingNewsLinks);

    return { coinDesk: this.cachedCoinDeskNewsLinks, investing: this.cachedInvestingNewsLinks };
  }
}

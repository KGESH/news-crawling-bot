import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../bot/bot.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_PREFIX, CoinDeskNewsLink } from './crawling.types';
import { CrawlingService } from './crawling.service';
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class NewsService {
  private logger = new Logger(NewsService.name);

  constructor(
    private botService: BotService,
    private configService: ConfigService,
    private crawlingService: CrawlingService,
    private httpService: HttpService,
    private redisService: RedisService,
  ) {}

  async crawlingCoinDeskNews() {
    const url = this.configService.get<string>('COIN_DESK_NEWS_URL');
    const baseUrl = this.crawlingService.getBaseUrl(url, '.com');
    const response = await firstValueFrom(this.httpService.get(url));
    const $ = cheerio.load(response.data);

    const newsLinks: CoinDeskNewsLink[] = [];

    for (const element of $('section#section-list li')) {
      const aTag = $(element).find('a');
      if (aTag) {
        const url = new URL(aTag.attr('href'), baseUrl);
        const params = new URLSearchParams(url.search);
        const postId = params.get('idxno'); // 게시글 번호

        const isCached = await this.redisService.get<string>(`${CACHE_PREFIX.COIN_DESK}/${postId}`);
        if (!isCached) {
          newsLinks.push({
            postId,
            url: url.href,
          });
        }
      }
    }

    newsLinks.forEach((item) => this.redisService.set(`${CACHE_PREFIX.COIN_DESK}/${item.postId}`, item.url));

    const sendMessagePromises = newsLinks.map((item) => this.botService.sendMessageToNewsChatRoom(item.url));
    this.logger.log(`newsLinks: `, newsLinks);

    const sendMessageResults = await Promise.allSettled(sendMessagePromises);

    /** Todo: Logging error */
    sendMessageResults.forEach((sendMessageResult) => {
      if (sendMessageResult.status === 'rejected') this.logger.error(sendMessageResult.reason);
    });
  }

  async crawlingInvestingNews() {
    const url = this.configService.get<string>('INVESTING_NEWS_URL');
    const baseUrl = this.crawlingService.getBaseUrl(url, '.com');
    const response = await firstValueFrom(this.httpService.get(url));
    const $ = cheerio.load(response.data);

    const newsLinks: CoinDeskNewsLink[] = [];

    for (const element of $('section#leftColumn div.largeTitle article[data-id]')) {
      const aTag = $(element).find('a');
      if (aTag) {
        const url = new URL(aTag.attr('href'), baseUrl);
        const postId = $(element).attr('data-id'); // 게시글 번호

        const isCached = await this.redisService.get<string>(`${CACHE_PREFIX.INVESTING}/${postId}`);
        if (!isCached) {
          newsLinks.push({
            postId,
            url: url.href,
          });
        }
      }
    }

    newsLinks.forEach((item) => this.redisService.set(`${CACHE_PREFIX.INVESTING}/${item.postId}`, item.url));

    const sendMessagePromises = newsLinks.map((item) => this.botService.sendMessageToNewsChatRoom(item.url));
    this.logger.log(`Investing News Links: `, newsLinks);

    const sendMessageResults = await Promise.allSettled(sendMessagePromises);

    /** Todo: Logging error */
    sendMessageResults.forEach((sendMessageResult) => {
      if (sendMessageResult.status === 'rejected') this.logger.error(sendMessageResult.reason);
    });
  }

  /** Todo: 퍼펫티어로 변경. 대상이 React로 개발된 페이지임 */
  async crawlingCoinNessNews() {
    const url = this.configService.get<string>('COIN_NESS_NEWS_URL');
    const baseUrl = this.crawlingService.getBaseUrl(url, '.com');
    const response = await firstValueFrom(this.httpService.get(url));
    const $ = cheerio.load(response.data);

    console.log('response: ', response.data);

    const newsLinks: CoinDeskNewsLink[] = [];

    let i = 0;
    for (const element of $('main > div:eq(1) > div:eq(2) > a')) {
      const aTag = new URL($(element).attr('href'));
      console.log('parsed A tag: ', aTag);

      if (aTag) {
        const url = aTag;
        // const url = new URL(aTag.attr('href'), baseUrl);
        const postId = `${i++}`;
        // const postId = $(element).attr('data-id'); // 게시글 번호

        const isCached = await this.redisService.get<string>(`${CACHE_PREFIX.COIN_NESS}/${postId}`);
        if (!isCached) {
          newsLinks.push({
            postId,
            url: url.href,
          });
        }
      }
    }

    console.log('newsLinks: ', newsLinks);
    newsLinks.forEach((item) => this.redisService.set(`${CACHE_PREFIX.INVESTING}/${item.postId}`, item.url));

    // const sendMessagePromises = newsLinks.map((item) => this.botService.sendMessageToNewsChatRoom(item.url));
    // this.logger.log(`CoinNess News Links: `, newsLinks);
    //
    // const sendMessageResults = await Promise.allSettled(sendMessagePromises);
    //
    // /** Todo: Logging error */
    // sendMessageResults.forEach((sendMessageResult) => {
    //   if (sendMessageResult.status === 'rejected') this.logger.error(sendMessageResult.reason);
    // });
  }

  async resetCache() {
    this.logger.log('Reset Cache');
    await this.redisService.reset();
  }

  /** Todo: replace to redis */
  showCache() {
    this.logger.log('CoinDesk News Links');
    this.logger.log('----------------');
    this.logger.log('Investing News Links');

    return { coinDesk: '', investing: '' };
  }
}

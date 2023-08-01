import { Controller, Get, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { CRON_SCHEDULE, INTERVAL_SCHEDULE } from './crawling.types';
import { NewsService } from './news.service';
import { ImageService } from './image.service';

@Controller('crawling')
export class CrawlingController {
  private logger = new Logger(CrawlingController.name);
  constructor(private newsService: NewsService, private imageService: ImageService) {}

  @Interval(INTERVAL_SCHEDULE.EVERY_10_MINUTES)
  async crawlingCoin360Image() {
    this.logger.log('Crawling Coin360 Image...');
    return this.imageService.crawlingCoin360Image();
  }

  @Interval(INTERVAL_SCHEDULE.EVERY_10_MINUTES)
  async crawlingFearGreedIndexImage() {
    this.logger.log('Crawling Fear & Greed Index Image...');
    return this.imageService.sendFearGreedIndexImage();
  }

  @Interval(INTERVAL_SCHEDULE.EVERY_2_MINUTES)
  async crawlingCoinDeskNews() {
    this.logger.log('Crawling CoinDesk News...');
    return this.newsService.crawlingCoinDeskNews();
  }

  @Interval(INTERVAL_SCHEDULE.EVERY_2_MINUTES)
  async crawlingInvestingNews() {
    this.logger.log('Crawling Investing News...');
    return this.newsService.crawlingInvestingNews();
  }

  @Cron(CRON_SCHEDULE.EVERY_1ST_DAY_OF_MONTH)
  resetCache() {
    this.logger.log('Reset Cache...');
    this.newsService.resetCache();
  }

  @Get('cache')
  showCache() {
    this.logger.log('Show Cache...');
    return this.newsService.showCache();
  }
}

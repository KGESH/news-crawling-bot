import { Module } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CrawlingController } from './crawling.controller';
import { BotModule } from '../bot/bot.module';
import { ImageService } from './image.service';
import { NewsService } from './news.service';

@Module({
  imports: [BotModule],
  controllers: [CrawlingController],
  providers: [CrawlingService, NewsService, ImageService],
})
export class CrawlingModule {}

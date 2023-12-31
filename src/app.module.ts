import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { CrawlingModule } from './crawling/crawling.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpClientModule } from './http/http-client.module';
import { RedisModule } from './cache/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.development',
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    CrawlingModule,
    HttpClientModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

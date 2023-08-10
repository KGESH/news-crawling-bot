import { CronExpression } from '@nestjs/schedule';

export type CoinDeskNewsLink = {
  url: string;
  postId: string;
};

export const CRON_SCHEDULE = {
  EVERY_1_MINUTE: CronExpression.EVERY_MINUTE,
  EVERY_10_MINUTES: CronExpression.EVERY_10_MINUTES,
  EVERY_30_MINUTES: CronExpression.EVERY_30_MINUTES,
  EVERY_10_SECONDS: CronExpression.EVERY_10_SECONDS,
  EVERY_30_SECONDS: CronExpression.EVERY_30_SECONDS,
  EVERY_1ST_DAY_OF_MONTH: CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT,
  EVERY_9_AM: '0 9 * * *',
} as const;

export const INTERVAL_SCHEDULE = {
  EVERY_1_MINUTE: 1000 * 60 * 1,
  EVERY_2_MINUTES: 1000 * 60 * 2,
  EVERY_3_MINUTES: 1000 * 60 * 3,
  EVERY_10_MINUTES: 1000 * 60 * 10,
  EVERY_30_MINUTES: 1000 * 60 * 30,
  EVERY_10_SECONDS: 1000 * 10,
  EVERY_30_SECONDS: 1000 * 30,
} as const;

export const CACHE_PREFIX = {
  COIN_DESK: 'coin_desk',
  INVESTING: 'investing',
  COIN_NESS: 'coin_ness',
} as const;

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
/** Todo: NestJS 공식 Redis Store 지원 이후 라이브러리 교체 필요 */
import { redisStore } from 'cache-manager-redis-yet';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        }),
      }),
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}

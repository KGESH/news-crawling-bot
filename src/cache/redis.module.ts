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
          url:
            process.env.NODE_ENV === 'production'
              ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
              : `redis://localhost:6379`,
        }),
      }),
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}

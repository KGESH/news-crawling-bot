import { Test } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { RedisModule } from './redis.module';

describe('CatsController', () => {
  let redisService: RedisService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [RedisService],
    }).compile();

    redisService = moduleRef.get<RedisService>(RedisService);
  });

  describe('[Redis Service]', () => {
    it('should be success get cached value', async () => {
      const willSave = 'cached';
      await redisService.set('key', willSave);

      const cached = await redisService.get<string>('key');
      expect(willSave).toStrictEqual(cached);
    });
  });
});

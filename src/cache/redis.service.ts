import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /** Default TTL -> disable expiration */
  async set(key: string, value: unknown, ttl = 0) {
    try {
      return this.cacheManager.set(key, value, ttl);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async get<T>(key: string): Promise<T> {
    try {
      return this.cacheManager.get(key);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async del(key: string) {
    try {
      return this.cacheManager.del(key);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async reset() {
    try {
      return this.cacheManager.reset();
    } catch (e) {
      this.logger.error(e);
    }
  }
}

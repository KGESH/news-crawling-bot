import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [
    HttpModule.register({
      timeout: 1000 * 60 * 2, // 2분
      maxRedirects: 5,
    }),
  ],
  exports: [HttpModule],
})
export class HttpClientModule {}

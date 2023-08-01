import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Is production: ', process.env.NODE_ENV === 'production');
  console.log(`REDIS_HOST: ${process.env.REDIS_HOST}`);
  console.log(`REDIS_PORT: ${process.env.REDIS_PORT}`);

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

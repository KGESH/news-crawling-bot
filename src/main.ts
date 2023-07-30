import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Is production: ', process.env.NODE_ENV === 'production');
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

import { Controller, Get, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  @Get('ping')
  healthCheck(): string {
    this.logger.log('Health check...');
    return 'pong';
  }
}

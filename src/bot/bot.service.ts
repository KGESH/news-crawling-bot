import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { TelegramBotMessage } from './bot.types';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BotService {
  private logger = new Logger(BotService.name);
  private readonly bot: TelegramBot;
  private readonly apiEndpoint: string;
  private readonly groupChatRoomId: string;
  private readonly newsThreadId: string; // 뉴스 기사 봇
  private readonly upDownThreadId: string; // 급등락 발생 봇
  private readonly reminderThreadId: string; // 정기 알림 봇

  constructor(private configService: ConfigService, private httpService: HttpService) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    this.apiEndpoint = this.configService.get<string>('TELEGRAM_API_ENDPOINT');
    this.groupChatRoomId = this.configService.get<string>('GROUP_CHAT_ROOM_ID');

    this.newsThreadId = this.configService.get<string>('NEWS_THREAD_ID');
    this.upDownThreadId = this.configService.get<string>('UPDOWN_THREAD_ID');
    this.reminderThreadId = this.configService.get<string>('REMINDER_THREAD_ID');

    this.bot = new TelegramBot(botToken, { polling: false });
    this.bot.on('message', this.onReceiveMessage);
  }

  private onReceiveMessage(msg: any) {
    this.logger.log(msg);
  }

  async sendMessageToUpDownChatRoom(message: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN_0');
    const url = `${this.apiEndpoint}/bot${botToken}/sendMessage`;

    return await this._sendMessage(url, {
      chatId: this.groupChatRoomId,
      messageThreadId: this.upDownThreadId,
      content: message,
    });
  }

  async sendMessageToNewsChatRoom(message: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN_1');
    const url = `${this.apiEndpoint}/bot${botToken}/sendMessage`;

    return await this._sendMessage(url, {
      chatId: this.groupChatRoomId,
      messageThreadId: this.newsThreadId,
      content: message,
    });
  }

  async sendMessageToReminderChatRoom(message: string) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN_2');
    const url = `${this.apiEndpoint}/bot${botToken}/sendMessage`;

    return await this._sendMessage(url, {
      chatId: this.groupChatRoomId,
      messageThreadId: this.reminderThreadId,
      content: message,
    });
  }

  private async _sendMessage(url: string, message: TelegramBotMessage) {
    this.logger.log(`Send message to ${url}`);
    this.logger.log(`Message: message`);

    return await firstValueFrom(
      this.httpService.post(
        url,
        {},
        {
          params: {
            chat_id: message.chatId,
            message_thread_id: message.messageThreadId,
            text: message.content,
          },
        },
      ),
    )
      .then((res) => res.data)
      .catch((e) => this.logger.error(e));
  }
}

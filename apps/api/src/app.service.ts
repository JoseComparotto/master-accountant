import { Injectable } from '@nestjs/common';
import { Message } from '@repo/core/entities/message.entity';

@Injectable()
export class AppService {
  getHello(): string {
    const message = Message.hello();
    return message.content;
  }
}

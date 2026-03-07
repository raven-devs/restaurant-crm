import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly chatId: string;

  constructor(private readonly config: ConfigService) {
    this.chatId = this.config.getOrThrow<string>('TELEGRAM_CHAT_ID');
  }

  formatOrderMessage(order: any): string {
    const items =
      order.items
        ?.map(
          (i: any) =>
            `  - ${i.nomenclature_item?.name || 'Unknown'} x${i.quantity}`,
        )
        .join('\n') || 'No items';

    return [
      `Order #${order.id?.slice(0, 8)}`,
      `Client: ${order.client?.name || 'Unknown'}`,
      `Status: ${order.status?.name || 'Unknown'}`,
      `Date: ${order.order_date}`,
      `Items:\n${items}`,
    ].join('\n');
  }

  getStatusTransitionButton(orderId: string, nextStatusName: string) {
    return {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Move to: ${nextStatusName}`,
              callback_data: `transition:${orderId}`,
            },
          ],
        ],
      },
    };
  }

  async sendNotification(bot: Telegraf, message: string) {
    await bot.telegram.sendMessage(this.chatId, message);
  }
}

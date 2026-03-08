import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly chatId: string;
  private readonly botToken: string;

  constructor(private readonly config: ConfigService) {
    this.chatId = this.config.getOrThrow<string>('TELEGRAM_CHAT_ID');
    this.botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  formatOrderMessage(order: any): string {
    const total = (order.items ?? []).reduce(
      (sum: number, i: any) =>
        sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
      0,
    );

    const date = order.order_date?.split('T')[0] ?? order.order_date;
    const health = order.color === 'red' ? 'Overdue' : 'On track';

    return [
      `Order #${order.id?.slice(0, 8)}`,
      `Health: ${health}`,
      `Date: ${date}`,
      `Client: ${order.client?.name || 'Unknown'}`,
      `Items: ${order.items?.length ?? 0}`,
      `Total: ${total.toFixed(2)}`,
      `Status: ${order.status?.name || 'Unknown'}`,
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

  async sendAlert(message: string) {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: this.chatId, text: message }),
    });
  }
}

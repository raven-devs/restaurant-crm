import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import type { OrderWithRelations } from '@shared/types/order';
import { t, tStatus } from '../i18n/i18n';

@Injectable()
export class TelegramService {
  private readonly chatId: string;
  private readonly botToken: string;

  constructor(private readonly config: ConfigService) {
    this.chatId = this.config.getOrThrow<string>('TELEGRAM_CHAT_ID');
    this.botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  formatOrderMessage(order: OrderWithRelations): string {
    const total = (order.items ?? []).reduce(
      (sum, i) => sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
      0,
    );

    const date = order.order_date?.split('T')[0] ?? order.order_date;
    const health =
      order.color === 'red'
        ? t('order.health.overdue')
        : t('order.health.onTrack');

    return [
      t('order.title', { id: order.id?.slice(0, 8) ?? '' }),
      t('order.health', { value: health }),
      t('order.date', { value: date ?? '' }),
      t('order.client', { value: order.client?.name || 'Unknown' }),
      t('order.items', { count: order.items?.length ?? 0 }),
      t('order.total', { value: total.toFixed(2) }),
      t('order.status', { value: order.status?.name || 'Unknown' }),
    ].join('\n');
  }

  getStatusTransitionButton(orderId: string, nextStatusName: string) {
    return {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: t('order.moveTo', { status: nextStatusName }),
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

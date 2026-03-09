import {
  Update,
  Start,
  Help,
  Command,
  Ctx,
  Action,
  InjectBot,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import type { SceneContext } from 'telegraf/scenes';
import { OrdersService } from '../orders/orders.service';
import { TelegramService } from './telegram.service';
import { t, tStatus } from '../i18n/i18n';

@Update()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(t('bot.welcome'));
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(t('bot.help'));
  }

  @Command('orders')
  async onOrders(@Ctx() ctx: Context) {
    const orders = await this.ordersService.findAll({});
    if (!orders.length) {
      await ctx.reply(t('bot.noOrders'));
      return;
    }

    for (const order of orders.slice(0, 10)) {
      const fullOrder = await this.ordersService.findOne(order.id);
      const message = this.telegramService.formatOrderMessage(fullOrder);

      if (fullOrder.status?.next_status_id) {
        const nextStatusName = tStatus(fullOrder.status.name);
        await ctx.reply(
          message,
          this.telegramService.getStatusTransitionButton(
            order.id,
            nextStatusName,
          ),
        );
      } else {
        await ctx.reply(message);
      }
    }
  }

  @Command('neworder')
  async onNewOrder(@Ctx() ctx: SceneContext) {
    await ctx.scene.enter('new-order');
  }

  @Action(/^transition:(.+)$/)
  async onTransition(@Ctx() ctx: Context) {
    const callbackQuery = ctx.callbackQuery;
    if (!callbackQuery || !('data' in callbackQuery)) return;

    const orderId = callbackQuery.data.replace('transition:', '');

    try {
      await this.ordersService.transitionStatus(orderId);
      const fullOrder = await this.ordersService.findOne(orderId);

      await ctx.answerCbQuery(t('bot.statusUpdated'));
      await ctx.editMessageText(
        this.telegramService.formatOrderMessage(fullOrder),
      );

      await this.telegramService.sendNotification(
        this.bot,
        t('bot.orderMoved', {
          id: orderId.slice(0, 8),
          status: fullOrder.status?.name ?? '',
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('bot.statusUpdateFailed');
      await ctx.answerCbQuery(message);
    }
  }
}

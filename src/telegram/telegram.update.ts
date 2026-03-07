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
import { OrdersService } from '../orders/orders.service';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      'Welcome to Restaurant CRM Bot!\n\n' +
        'Commands:\n' +
        '/orders - List recent orders\n' +
        '/neworder - Create a new order\n' +
        '/help - Show help',
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      'Available commands:\n' +
        '/orders - List recent orders\n' +
        '/neworder - Start creating a new order\n' +
        '/help - Show this help message',
    );
  }

  @Command('orders')
  async onOrders(@Ctx() ctx: Context) {
    const orders = await this.ordersService.findAll({});
    if (!orders.length) {
      await ctx.reply('No orders found.');
      return;
    }

    for (const order of orders.slice(0, 10)) {
      const fullOrder = await this.ordersService.findOne(order.id);
      const message = this.telegramService.formatOrderMessage(fullOrder);

      if (fullOrder.status?.next_status_id) {
        const nextStatusName = this.getNextStatusName(fullOrder.status.name);
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
  async onNewOrder(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('new-order');
  }

  @Action(/^transition:(.+)$/)
  async onTransition(@Ctx() ctx: Context) {
    const callbackQuery = ctx.callbackQuery;
    if (!callbackQuery || !('data' in callbackQuery)) return;

    const orderId = callbackQuery.data.replace('transition:', '');

    try {
      const updated = await this.ordersService.transitionStatus(orderId);
      const fullOrder = await this.ordersService.findOne(orderId);

      await ctx.answerCbQuery('Status updated!');
      await ctx.editMessageText(
        this.telegramService.formatOrderMessage(fullOrder),
      );

      await this.telegramService.sendNotification(
        this.bot,
        `Order #${orderId.slice(0, 8)} moved to: ${fullOrder.status?.name}`,
      );
    } catch (error: any) {
      await ctx.answerCbQuery(error.message || 'Failed to update status');
    }
  }

  private getNextStatusName(currentName: string): string {
    const flow: Record<string, string> = {
      New: 'Accepted',
      Accepted: 'In Production',
      'In Production': 'Ready',
      Ready: 'Closed',
    };
    return flow[currentName] || 'Next Status';
  }
}

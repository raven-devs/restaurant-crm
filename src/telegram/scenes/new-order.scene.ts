import { Wizard, WizardStep, Ctx, Action } from 'nestjs-telegraf';
import type { WizardContext } from 'telegraf/scenes';
import { ClientsService } from '../../clients/clients.service';
import { NomenclatureService } from '../../nomenclature/nomenclature.service';
import { SalesChannelsService } from '../../sales-channels/sales-channels.service';
import { OrdersService } from '../../orders/orders.service';
import { TelegramService } from '../telegram.service';

interface WizardState {
  client_id?: string;
  client_name?: string;
  items: Array<{
    nomenclature_item_id: string;
    name: string;
    quantity: number;
  }>;
  sales_channel_id?: string;
  channel_name?: string;
}

function getCallbackData(ctx: WizardContext): string | undefined {
  const query = ctx.callbackQuery;
  return query && 'data' in query ? query.data : undefined;
}

@Wizard('new-order')
export class NewOrderScene {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly nomenclatureService: NomenclatureService,
    private readonly salesChannelsService: SalesChannelsService,
    private readonly ordersService: OrdersService,
    private readonly telegramService: TelegramService,
  ) {}

  @WizardStep(1)
  async step1(@Ctx() ctx: WizardContext) {
    const clients = await this.clientsService.findAll();
    const buttons = clients.map((c) => [
      {
        text: `${c.name} (${c.phone})`,
        callback_data: `client:${c.id}:${c.name}`,
      },
    ]);

    (ctx.wizard.state as WizardState).items = [];
    await ctx.reply('Step 1/4: Select a client:', {
      reply_markup: { inline_keyboard: buttons },
    });
  }

  @Action(/^client:(.+):(.+)$/)
  async onClientSelect(@Ctx() ctx: WizardContext) {
    const data = getCallbackData(ctx);
    if (!data) return;

    const match = data.match(/^client:(.+?):(.+)$/);
    if (!match) return;

    const [, clientId, clientName] = match;
    const state = ctx.wizard.state as WizardState;
    state.client_id = clientId;
    state.client_name = clientName;

    await ctx.answerCbQuery(`Selected: ${clientName}`);
    await this.showNomenclature(ctx);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2() {
    // Item selection handled via action callbacks
  }

  private async showNomenclature(ctx: WizardContext) {
    const items = await this.nomenclatureService.findAll();
    const buttons = items.map((i) => [
      {
        text: `${i.name} - ${i.price} UAH`,
        callback_data: `item:${i.id}:${i.name}`,
      },
    ]);
    buttons.push([{ text: 'Done adding items', callback_data: 'items_done' }]);

    await ctx.reply(
      'Step 2/4: Select items (tap to add, "Done" when finished):',
      {
        reply_markup: { inline_keyboard: buttons },
      },
    );
  }

  @Action(/^item:(.+):(.+)$/)
  async onItemSelect(@Ctx() ctx: WizardContext) {
    const data = getCallbackData(ctx);
    if (!data) return;

    const match = data.match(/^item:(.+?):(.+)$/);
    if (!match) return;

    const [, itemId, itemName] = match;
    const state = ctx.wizard.state as WizardState;

    const existing = state.items.find((i) => i.nomenclature_item_id === itemId);
    if (existing) {
      existing.quantity += 1;
      await ctx.answerCbQuery(`${itemName} x${existing.quantity}`);
    } else {
      state.items.push({
        nomenclature_item_id: itemId,
        name: itemName,
        quantity: 1,
      });
      await ctx.answerCbQuery(`Added: ${itemName}`);
    }
  }

  @Action('items_done')
  async onItemsDone(@Ctx() ctx: WizardContext) {
    const state = ctx.wizard.state as WizardState;
    if (!state.items.length) {
      await ctx.answerCbQuery('Please add at least one item');
      return;
    }

    await ctx.answerCbQuery();

    const channels = await this.salesChannelsService.findAll();
    const buttons = channels.map((ch) => [
      { text: ch.name, callback_data: `channel:${ch.id}:${ch.name}` },
    ]);

    await ctx.reply('Step 3/4: Select sales channel:', {
      reply_markup: { inline_keyboard: buttons },
    });
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3() {
    // Channel selection handled via action callbacks
  }

  @Action(/^channel:(.+):(.+)$/)
  async onChannelSelect(@Ctx() ctx: WizardContext) {
    const data = getCallbackData(ctx);
    if (!data) return;

    const match = data.match(/^channel:(.+?):(.+)$/);
    if (!match) return;

    const [, channelId, channelName] = match;
    const state = ctx.wizard.state as WizardState;
    state.sales_channel_id = channelId;
    state.channel_name = channelName;

    await ctx.answerCbQuery(`Selected: ${channelName}`);

    const itemsList = state.items
      .map((i) => `  - ${i.name} x${i.quantity}`)
      .join('\n');
    await ctx.reply(
      `Step 4/4: Confirm order:\n\n` +
        `Client: ${state.client_name}\n` +
        `Channel: ${state.channel_name}\n` +
        `Items:\n${itemsList}\n\n` +
        `Create this order?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Confirm', callback_data: 'confirm_order' }],
            [{ text: 'Cancel', callback_data: 'cancel_order' }],
          ],
        },
      },
    );
    ctx.wizard.next();
  }

  @WizardStep(4)
  async step4() {
    // Confirmation handled via action callbacks
  }

  @Action('confirm_order')
  async onConfirm(@Ctx() ctx: WizardContext) {
    const state = ctx.wizard.state as WizardState;

    try {
      const order = await this.ordersService.create({
        client_id: state.client_id!,
        sales_channel_id: state.sales_channel_id!,
        items: state.items.map((i) => ({
          nomenclature_item_id: i.nomenclature_item_id,
          quantity: i.quantity,
        })),
      });

      await ctx.answerCbQuery('Order created!');
      await ctx.reply(
        `Order created successfully! ID: ${order.id?.slice(0, 8)}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create order';
      await ctx.answerCbQuery('Error creating order');
      await ctx.reply(`Error: ${message}`);
    }

    await ctx.scene.leave();
  }

  @Action('cancel_order')
  async onCancel(@Ctx() ctx: WizardContext) {
    await ctx.answerCbQuery('Order cancelled');
    await ctx.reply('Order creation cancelled.');
    await ctx.scene.leave();
  }
}

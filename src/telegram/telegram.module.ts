import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigService } from '@nestjs/config';
import { session } from 'telegraf';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { NewOrderScene } from './scenes/new-order.scene';
import { OrdersModule } from '../orders/orders.module';
import { ClientsModule } from '../clients/clients.module';
import { NomenclatureModule } from '../nomenclature/nomenclature.module';
import { SalesChannelsModule } from '../sales-channels/sales-channels.module';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        token: config.getOrThrow<string>('TELEGRAM_BOT_TOKEN'),
        middlewares: [session()],
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
    ClientsModule,
    NomenclatureModule,
    SalesChannelsModule,
  ],
  providers: [TelegramUpdate, TelegramService, NewOrderScene],
})
export class TelegramModule {}

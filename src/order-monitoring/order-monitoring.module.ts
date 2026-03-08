import { Module } from '@nestjs/common';
import { TelegramModule } from '../telegram/telegram.module';
import { OrderMonitoringService } from './order-monitoring.service';

@Module({
  imports: [TelegramModule],
  providers: [OrderMonitoringService],
})
export class OrderMonitoringModule {}

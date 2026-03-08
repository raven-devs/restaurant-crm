import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ClientsModule } from './clients/clients.module';
import { NomenclatureModule } from './nomenclature/nomenclature.module';
import { OrgStructureModule } from './org-structure/org-structure.module';
import { SalesChannelsModule } from './sales-channels/sales-channels.module';
import { EmployeesModule } from './employees/employees.module';
import { OrderStatusesModule } from './order-statuses/order-statuses.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { TelegramModule } from './telegram/telegram.module';
import { OrderMonitoringModule } from './order-monitoring/order-monitoring.module';
import { AppSettingsModule } from './app-settings/app-settings.module';
import { AuditInterceptor } from './audit/audit.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    SupabaseModule,
    ClientsModule,
    NomenclatureModule,
    OrgStructureModule,
    SalesChannelsModule,
    EmployeesModule,
    OrderStatusesModule,
    OrdersModule,
    AuthModule,
    ReportsModule,
    TelegramModule,
    OrderMonitoringModule,
    AppSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}

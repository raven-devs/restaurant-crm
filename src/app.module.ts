import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { SupabaseModule } from './supabase/supabase.module';
import { ClientsModule } from './clients/clients.module';
import { NomenclatureModule } from './nomenclature/nomenclature.module';
import { OrgStructureModule } from './org-structure/org-structure.module';
import { SalesChannelsModule } from './sales-channels/sales-channels.module';
import { EmployeesModule } from './employees/employees.module';
import { OrderStatusesModule } from './order-statuses/order-statuses.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    SupabaseModule,
    ClientsModule,
    NomenclatureModule,
    OrgStructureModule,
    SalesChannelsModule,
    EmployeesModule,
    OrderStatusesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

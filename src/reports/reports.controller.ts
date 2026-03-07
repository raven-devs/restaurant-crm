import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders')
  getOrderReport(
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('status_id') statusId?: string,
    @Query('client_id') clientId?: string,
    @Query('sales_channel_id') salesChannelId?: string,
  ) {
    return this.reportsService.getOrderReport({
      date_from: dateFrom,
      date_to: dateTo,
      status_id: statusId,
      client_id: clientId,
      sales_channel_id: salesChannelId,
    });
  }
}

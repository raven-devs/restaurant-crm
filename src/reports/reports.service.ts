import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface ReportFilters {
  date_from?: string;
  date_to?: string;
  status_id?: string;
  client_id?: string;
  sales_channel_id?: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly supabase: SupabaseService) {}

  async getOrderReport(filters: ReportFilters) {
    const client = this.supabase.getClient();

    let query = client
      .from('orders')
      .select(
        `
        *,
        client:clients(name, phone),
        status:order_statuses(name),
        sales_channel:sales_channels(name),
        org_unit:org_units(name),
        accepted_by_employee:employees(name),
        items:order_items(*, nomenclature_item:nomenclature_items(name, price)),
        status_history:order_status_history(*, status:order_statuses(name))
      `,
      )
      .order('created_at', { ascending: false })
      .order('entered_at', {
        ascending: true,
        referencedTable: 'order_status_history',
      });

    if (filters.date_from) query = query.gte('order_date', filters.date_from);
    if (filters.date_to) query = query.lte('order_date', filters.date_to);
    if (filters.status_id)
      query = query.eq('current_status_id', filters.status_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.sales_channel_id)
      query = query.eq('sales_channel_id', filters.sales_channel_id);

    const { data, error } = await query;
    if (error) throw error;

    return data.map((order) => ({
      ...order,
      time_since_creation_ms:
        Date.now() - new Date(order.created_at as string).getTime(),
      stage_durations: (order.status_history as any[])
        .filter((h) => h.exited_at)
        .map((h) => ({
          status_name: h.status?.name,
          entered_at: h.entered_at,
          exited_at: h.exited_at,
          duration_ms:
            new Date(h.exited_at as string).getTime() -
            new Date(h.entered_at as string).getTime(),
        })),
    }));
  }
}

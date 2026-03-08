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
        id, order_date, created_at,
        client:clients(name, phone),
        status:order_statuses(name),
        sales_channel:sales_channels(name),
        accepted_by:employees(name),
        items:order_items(id)
      `,
      )
      .order('created_at', { ascending: false });

    if (filters.date_from) query = query.gte('order_date', filters.date_from);
    if (filters.date_to) query = query.lte('order_date', filters.date_to);
    if (filters.status_id) query = query.eq('status_id', filters.status_id);
    if (filters.client_id) query = query.eq('client_id', filters.client_id);
    if (filters.sales_channel_id)
      query = query.eq('sales_channel_id', filters.sales_channel_id);

    const { data, error } = await query;
    if (error) throw error;

    return data.map((order: any) => ({
      id: order.id,
      order_date: order.order_date,
      created_at: order.created_at,
      client_name: order.client?.name ?? '—',
      client_phone: order.client?.phone ?? '—',
      items_count: order.items?.length ?? 0,
      sales_channel_name: order.sales_channel?.name ?? '—',
      status_name: order.status?.name ?? '—',
      accepted_by_name: order.accepted_by?.name ?? null,
      time_since_creation:
        (Date.now() - new Date(order.created_at).getTime()) / 60000,
      time_per_stage: null,
    }));
  }
}

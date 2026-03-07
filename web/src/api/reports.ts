import { apiFetch } from '@/lib/api';

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  status_id?: string;
  client_id?: string;
  sales_channel_id?: string;
}

export interface ReportRow {
  id: string;
  order_date: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  items_count: number;
  sales_channel_name: string;
  status_name: string;
  accepted_by_name: string | null;
  time_since_creation: number | null;
  time_per_stage: Record<string, number> | null;
}

export function getOrdersReport(filters?: ReportFilters) {
  const params = new URLSearchParams();
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);
  if (filters?.status_id) params.set('status_id', filters.status_id);
  if (filters?.client_id) params.set('client_id', filters.client_id);
  if (filters?.sales_channel_id)
    params.set('sales_channel_id', filters.sales_channel_id);
  const qs = params.toString();
  return apiFetch<ReportRow[]>(`/reports/orders${qs ? `?${qs}` : ''}`);
}

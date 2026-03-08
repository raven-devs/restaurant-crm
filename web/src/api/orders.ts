import { apiFetch } from '@/lib/api';
import type {
  Client,
  NomenclatureItem,
  SalesChannel,
  OrderStatus,
  Employee,
} from '@/api/references';

export interface OrderItem {
  id: string;
  nomenclature_item_id: string;
  nomenclature_item?: NomenclatureItem;
  quantity: number;
  price_at_order?: number;
}

export interface Order {
  id: string;
  created_at: string;
  order_date: string;
  client_id: string;
  client?: Client;
  sales_channel_id: string;
  sales_channel?: SalesChannel;
  status_id: string;
  status?: OrderStatus;
  accepted_by_id: string | null;
  accepted_by?: Employee | null;
  order_point_id: string | null;
  color: 'green' | 'red';
  items: OrderItem[];
}

export interface OrderFilters {
  status_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
}

export function getOrders(filters?: OrderFilters) {
  const params = new URLSearchParams();
  if (filters?.status_id) params.set('status_id', filters.status_id);
  if (filters?.client_id) params.set('client_id', filters.client_id);
  if (filters?.date_from) params.set('date_from', filters.date_from);
  if (filters?.date_to) params.set('date_to', filters.date_to);
  const qs = params.toString();
  return apiFetch<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
}

export function getOrder(id: string) {
  return apiFetch<Order>(`/orders/${id}`);
}

export interface CreateOrderPayload {
  client_id: string;
  sales_channel_id: string;
  items: { nomenclature_item_id: string; quantity: number }[];
}

export function createOrder(data: CreateOrderPayload) {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteOrder(id: string) {
  return apiFetch(`/orders/${id}`, { method: 'DELETE' });
}

export function advanceOrderStatus(orderId: string, employeeId?: string) {
  return apiFetch<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(employeeId ? { employee_id: employeeId } : {}),
  });
}

export function addOrderItem(
  orderId: string,
  data: { nomenclature_item_id: string; quantity: number },
) {
  return apiFetch<OrderItem>(`/orders/${orderId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateOrderItem(
  orderId: string,
  itemId: string,
  data: { quantity: number },
) {
  return apiFetch<OrderItem>(`/orders/${orderId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteOrderItem(orderId: string, itemId: string) {
  return apiFetch(`/orders/${orderId}/items/${itemId}`, { method: 'DELETE' });
}

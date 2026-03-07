import type {
  Client,
  NomenclatureItem,
  Employee,
  SalesChannel,
  OrderStatus,
} from './reference.js';

export interface Order {
  id: string;
  order_date: string;
  client_id: string;
  order_point: string | null;
  sales_channel_id: string;
  accepted_by_id: string | null;
  status_id: string;
  color: 'green' | 'red';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  nomenclature_item_id: string;
  quantity: number;
  price_at_order: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status_id: string;
  entered_at: string;
  exited_at: string | null;
  changed_by_id: string | null;
}

export interface OrderWithRelations extends Order {
  client: Client;
  sales_channel: SalesChannel;
  accepted_by: Employee | null;
  status: OrderStatus;
  items: (OrderItem & { nomenclature_item: NomenclatureItem })[];
  status_history: (OrderStatusHistory & { status: OrderStatus })[];
}

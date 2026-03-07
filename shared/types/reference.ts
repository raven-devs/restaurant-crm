export interface Client {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface NomenclatureItem {
  id: string;
  name: string;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  org_unit_id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesChannel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatus {
  id: string;
  name: string;
  previous_status_id: string | null;
  next_status_id: string | null;
  max_time_unconfirmed: string | null;
  max_time_in_status: string | null;
  escalation_action: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

import { apiFetch } from '@/lib/api';

export interface Client {
  id: string;
  name: string;
  phone: string;
}

export interface NomenclatureItem {
  id: string;
  name: string;
  price: number;
}

export interface Employee {
  id: string;
  name: string;
  org_unit_id: string;
  org_unit?: { name: string };
}

export interface OrgUnit {
  id: string;
  name: string;
}

export interface SalesChannel {
  id: string;
  name: string;
}

export interface OrderStatus {
  id: string;
  name: string;
  previous_status: string | null;
  next_status: string | null;
  max_time_without_confirmation: number | null;
  max_time_in_status: number | null;
  escalation: string | null;
}

export const getClients = () => apiFetch<Client[]>('/clients');
export const createClient = (data: Omit<Client, 'id'>) =>
  apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(data) });
export const updateClient = (id: string, data: Partial<Omit<Client, 'id'>>) =>
  apiFetch<Client>(`/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteClient = (id: string) =>
  apiFetch(`/clients/${id}`, { method: 'DELETE' });

export const getNomenclature = () =>
  apiFetch<NomenclatureItem[]>('/nomenclature');
export const createNomenclatureItem = (data: Omit<NomenclatureItem, 'id'>) =>
  apiFetch<NomenclatureItem>('/nomenclature', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateNomenclatureItem = (
  id: string,
  data: Partial<Omit<NomenclatureItem, 'id'>>,
) =>
  apiFetch<NomenclatureItem>(`/nomenclature/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteNomenclatureItem = (id: string) =>
  apiFetch(`/nomenclature/${id}`, { method: 'DELETE' });

export const getEmployees = () => apiFetch<Employee[]>('/employees');
export const createEmployee = (data: Omit<Employee, 'id'>) =>
  apiFetch<Employee>('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateEmployee = (
  id: string,
  data: Partial<Omit<Employee, 'id'>>,
) =>
  apiFetch<Employee>(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteEmployee = (id: string) =>
  apiFetch(`/employees/${id}`, { method: 'DELETE' });

export const getOrgUnits = () => apiFetch<OrgUnit[]>('/org-units');
export const createOrgUnit = (data: Omit<OrgUnit, 'id'>) =>
  apiFetch<OrgUnit>('/org-units', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateOrgUnit = (id: string, data: Partial<Omit<OrgUnit, 'id'>>) =>
  apiFetch<OrgUnit>(`/org-units/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteOrgUnit = (id: string) =>
  apiFetch(`/org-units/${id}`, { method: 'DELETE' });

export const getSalesChannels = () =>
  apiFetch<SalesChannel[]>('/sales-channels');
export const createSalesChannel = (data: Omit<SalesChannel, 'id'>) =>
  apiFetch<SalesChannel>('/sales-channels', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateSalesChannel = (
  id: string,
  data: Partial<Omit<SalesChannel, 'id'>>,
) =>
  apiFetch<SalesChannel>(`/sales-channels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteSalesChannel = (id: string) =>
  apiFetch(`/sales-channels/${id}`, { method: 'DELETE' });

export const getOrderStatuses = () =>
  apiFetch<OrderStatus[]>('/order-statuses');

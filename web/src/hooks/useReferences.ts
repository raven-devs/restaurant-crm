import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getNomenclature,
  createNomenclatureItem,
  updateNomenclatureItem,
  deleteNomenclatureItem,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getOrgUnits,
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  getSalesChannels,
  createSalesChannel,
  updateSalesChannel,
  deleteSalesChannel,
  getOrderStatuses,
} from '@/api/references';

function useCrudHooks<T>(
  queryKey: string,
  fetchFn: () => Promise<T[]>,
  createFn?: (data: unknown) => Promise<T>,
  updateFn?: (id: string, data: unknown) => Promise<T>,
  deleteFn?: (id: string) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey] });

  const query = useQuery({ queryKey: [queryKey], queryFn: fetchFn });

  const create = useMutation({
    mutationFn: createFn ?? (() => Promise.reject()),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateFn ? updateFn(id, data) : Promise.reject(),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteFn ?? (() => Promise.reject()),
    onSuccess: invalidate,
  });

  return { query, create, update, remove };
}

export function useClients() {
  return useCrudHooks(
    'clients',
    getClients,
    createClient,
    updateClient,
    deleteClient,
  );
}

export function useNomenclature() {
  return useCrudHooks(
    'nomenclature',
    getNomenclature,
    createNomenclatureItem,
    updateNomenclatureItem,
    deleteNomenclatureItem,
  );
}

export function useEmployees() {
  return useCrudHooks(
    'employees',
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  );
}

export function useOrgUnits() {
  return useCrudHooks(
    'org-units',
    getOrgUnits,
    createOrgUnit,
    updateOrgUnit,
    deleteOrgUnit,
  );
}

export function useSalesChannels() {
  return useCrudHooks(
    'sales-channels',
    getSalesChannels,
    createSalesChannel,
    updateSalesChannel,
    deleteSalesChannel,
  );
}

export function useOrderStatuses() {
  return useQuery({ queryKey: ['order-statuses'], queryFn: getOrderStatuses });
}

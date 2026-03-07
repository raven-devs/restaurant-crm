import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  getOrder,
  createOrder,
  advanceOrderStatus,
  type OrderFilters,
  type CreateOrderPayload,
} from '@/api/orders';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrders(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => createOrder(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useAdvanceOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      employeeId,
    }: {
      orderId: string;
      employeeId?: string;
    }) => advanceOrderStatus(orderId, employeeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

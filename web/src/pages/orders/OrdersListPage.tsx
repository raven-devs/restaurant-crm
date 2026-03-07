import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useOrderStatuses } from '@/hooks/useReferences';
import type { OrderFilters, Order } from '@/api/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/DataTable';
import { Eye } from 'lucide-react';

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  New: 'outline',
  Accepted: 'secondary',
  'In Production': 'default',
  Ready: 'default',
  Closed: 'secondary',
};

export function OrdersListPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: statuses } = useOrderStatuses();

  const activeFilters: OrderFilters = {
    ...filters,
    ...(statusFilter ? { status_id: statusFilter } : {}),
  };
  const { data, isLoading, error } = useOrders(activeFilters);

  const columns: Column<Order>[] = [
    {
      header: 'Date',
      accessor: (row) => new Date(row.order_date).toLocaleDateString(),
    },
    {
      header: 'Client',
      accessor: (row) => row.client?.name ?? row.client_id,
    },
    {
      header: 'Items',
      accessor: (row) => row.items?.length ?? 0,
    },
    {
      header: 'Status',
      accessor: (row) => {
        const name = row.status?.name ?? '—';
        return <Badge variant={statusVariant[name] ?? 'outline'}>{name}</Badge>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Orders</h1>
        <Button size="sm" asChild>
          <Link to="/orders/new">New Order</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {statuses?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          placeholder="From"
          className="w-40"
          value={filters.date_from ?? ''}
          onChange={(e) =>
            setFilters((p) => ({
              ...p,
              date_from: e.target.value || undefined,
            }))
          }
        />
        <Input
          type="date"
          placeholder="To"
          className="w-40"
          value={filters.date_to ?? ''}
          onChange={(e) =>
            setFilters((p) => ({ ...p, date_to: e.target.value || undefined }))
          }
        />
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && (
        <DataTable
          columns={columns}
          data={data}
          actions={(row) => (
            <Button variant="ghost" size="icon-xs" asChild>
              <Link to={`/orders/${row.id}`}>
                <Eye />
              </Link>
            </Button>
          )}
        />
      )}
    </div>
  );
}

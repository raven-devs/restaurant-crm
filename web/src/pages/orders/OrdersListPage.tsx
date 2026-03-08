import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { useOrderStatuses } from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import type { OrderFilters, Order } from '@/api/orders';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/IconButton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable, type Column } from '@/components/DataTable';
import { STATUS_COLORS } from '@/lib/status-colors';
import { Eye } from 'lucide-react';

export function OrdersListPage() {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [colorFilter, setColorFilter] = useState<string>('');
  const [clientSearch, setClientSearch] = useState('');
  const { query: statusesQuery } = useOrderStatuses();
  const statuses = statusesQuery.data;
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';

  const activeFilters: OrderFilters = {
    ...filters,
    ...(statusFilter ? { status_id: statusFilter } : {}),
  };
  const { data, isLoading, error } = useOrders(activeFilters);

  const columns: Column<Order>[] = [
    {
      header: 'ID',
      accessor: (row) => `#${row.id.slice(0, 8)}`,
      sortable: false,
    },
    {
      header: 'Order Health',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`inline-block size-3 rounded-full ${row.color === 'red' ? 'bg-red-500' : 'bg-green-500'}`}
          />
          {row.color === 'red' ? 'Overdue' : 'On track'}
        </span>
      ),
      sortable: false,
    },
    {
      header: 'Order Date',
      accessor: (row) => new Date(row.order_date).toLocaleDateString(),
      sortValue: (row) => row.order_date,
    },
    {
      header: 'Client',
      accessor: (row) => row.client?.name ?? row.client_id,
      sortValue: (row) => row.client?.name ?? '',
    },
    {
      header: 'Items',
      accessor: (row) => row.items?.length ?? 0,
      sortValue: (row) => row.items?.length ?? 0,
    },
    {
      header: `Total (${currency})`,
      accessor: (row) => {
        const total = (row.items ?? []).reduce(
          (sum, i) => sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
          0,
        );
        return total.toLocaleString('uk-UA', { minimumFractionDigits: 2 });
      },
      sortValue: (row) =>
        (row.items ?? []).reduce(
          (sum, i) => sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
          0,
        ),
      totalValue: (rows) =>
        rows
          .reduce(
            (sum, r) =>
              sum +
              (r.items ?? []).reduce(
                (s, i) => s + (i.quantity ?? 0) * (i.price_at_order ?? 0),
                0,
              ),
            0,
          )
          .toLocaleString('uk-UA', { minimumFractionDigits: 2 }),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const name = row.status?.name ?? '—';
        return (
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span
              className={`inline-block size-2 rounded-full ${STATUS_COLORS[name] ?? 'bg-gray-400'}`}
            />
            {name}
          </span>
        );
      },
      sortValue: (row) => row.status?.name ?? '',
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
          value={colorFilter || '__all__'}
          onValueChange={(val) => setColorFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {colorFilter === 'green' ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-green-500" />
                  On track
                </span>
              ) : colorFilter === 'red' ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-red-500" />
                  Overdue
                </span>
              ) : (
                'All orders'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All orders</SelectItem>
            <SelectItem value="green">
              <span className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-green-500" />
                On track
              </span>
            </SelectItem>
            <SelectItem value="red">
              <span className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-red-500" />
                Overdue
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses">
              {statusFilter
                ? (() => {
                    const s = statuses?.find((s) => s.id === statusFilter);
                    if (!s) return undefined;
                    return (
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block size-2 rounded-full ${STATUS_COLORS[s.name] ?? 'bg-gray-400'}`}
                        />
                        {s.name}
                      </span>
                    );
                  })()
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {statuses?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block size-2 rounded-full ${STATUS_COLORS[s.name] ?? 'bg-gray-400'}`}
                  />
                  {s.name}
                </span>
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
        <Input
          placeholder="Search by client..."
          className="w-48"
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
        />
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && (
        <DataTable
          columns={columns}
          data={data
            .filter((o) => !colorFilter || o.color === colorFilter)
            .filter((o) => {
              if (clientSearch.length < 2) return true;
              const name = o.client?.name ?? '';
              return name.toLowerCase().includes(clientSearch.toLowerCase());
            })}
          actions={(row) => (
            <IconButton tooltip="View" variant="ghost" size="icon-sm" asChild>
              <Link to={`/orders/${row.id}`}>
                <Eye />
              </Link>
            </IconButton>
          )}
        />
      )}
    </div>
  );
}

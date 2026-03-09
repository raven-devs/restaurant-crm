import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import { useOrderStatuses } from '@/hooks/useReferences';
import { PageError } from '@/components/PageError';
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
import { STATUS_COLORS, STATUS_TAG_COLORS } from '@/lib/status-colors';
import { exportToCSV } from '@/lib/csv';
import { Eye, Download } from 'lucide-react';

export function OrdersListPage() {
  const { t } = useTranslation();
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

  const filteredOrders = useMemo(
    () =>
      (data ?? [])
        .filter((o) => !colorFilter || o.color === colorFilter)
        .filter((o) => {
          if (clientSearch.length < 2) return true;
          const name = o.client?.name ?? '';
          return name.toLowerCase().includes(clientSearch.toLowerCase());
        }),
    [data, colorFilter, clientSearch],
  );

  const columns: Column<Order>[] = [
    {
      header: t('orders.id'),
      accessor: (row) => `#${row.id.slice(0, 8)}`,
      csvValue: (row) => row.id.slice(0, 8),
      sortable: false,
    },
    {
      header: t('orders.orderHealth'),
      accessor: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`inline-block size-3 rounded-full ${row.color === 'red' ? 'bg-red-500' : 'bg-green-500'}`}
          />
          {row.color === 'red' ? t('orders.overdue') : t('orders.onTrack')}
        </span>
      ),
      csvValue: (row) =>
        row.color === 'red' ? t('orders.overdue') : t('orders.onTrack'),
      sortable: false,
    },
    {
      header: t('orders.orderDate'),
      accessor: (row) => new Date(row.order_date).toLocaleDateString(),
      csvValue: (row) => row.order_date,
      sortValue: (row) => row.order_date,
    },
    {
      header: t('orders.client'),
      accessor: (row) => row.client?.name ?? row.client_id,
      csvValue: (row) => row.client?.name ?? '',
      sortValue: (row) => row.client?.name ?? '',
    },
    {
      header: t('orders.items'),
      accessor: (row) => row.items?.length ?? 0,
      csvValue: (row) => row.items?.length ?? 0,
      sortValue: (row) => row.items?.length ?? 0,
    },
    {
      header: t('orders.total', { currency }),
      accessor: (row) => {
        const total = (row.items ?? []).reduce(
          (sum, i) => sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
          0,
        );
        return total.toLocaleString('uk-UA', { minimumFractionDigits: 2 });
      },
      csvValue: (row) =>
        (row.items ?? []).reduce(
          (sum, i) => sum + (i.quantity ?? 0) * (i.price_at_order ?? 0),
          0,
        ),
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
      header: t('orders.status'),
      accessor: (row) => {
        const name = row.status?.name ?? '—';
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TAG_COLORS[name] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {name}
          </span>
        );
      },
      csvValue: (row) => row.status?.name ?? '',
      sortValue: (row) => row.status?.name ?? '',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {error && <PageError message={error.message} />}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('orders.title')}</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('orders.searchByClient')}
            className="w-48"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
          />
          {filteredOrders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportToCSV(columns, filteredOrders, 'orders')}
            >
              <Download className="mr-1.5 size-4" />
              {t('common.export')}
            </Button>
          )}
          <Button render={<Link to="/orders/new" />} size="sm">
            {t('orders.newOrder')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select
          value={colorFilter || '__all__'}
          onValueChange={(val) =>
            setColorFilter(val === '__all__' || val == null ? '' : val)
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue>
              {colorFilter === 'green' ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-green-500" />
                  {t('orders.onTrack')}
                </span>
              ) : colorFilter === 'red' ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-red-500" />
                  {t('orders.overdue')}
                </span>
              ) : (
                t('orders.allOrders')
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t('orders.allOrders')}</SelectItem>
            <SelectItem value="green">
              <span className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-green-500" />
                {t('orders.onTrack')}
              </span>
            </SelectItem>
            <SelectItem value="red">
              <span className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-red-500" />
                {t('orders.overdue')}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(val) =>
            setStatusFilter(val === '__all__' || val == null ? '' : val)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('orders.allStatuses')}>
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
            <SelectItem value="__all__">{t('orders.allStatuses')}</SelectItem>
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
          placeholder={t('reports.from')}
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
          placeholder={t('reports.to')}
          className="w-40"
          value={filters.date_to ?? ''}
          onChange={(e) =>
            setFilters((p) => ({ ...p, date_to: e.target.value || undefined }))
          }
        />
      </div>

      {isLoading && (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      )}
      {data && (
        <DataTable
          columns={columns}
          data={filteredOrders}
          actions={(row) => (
            <IconButton
              tooltip={t('orders.view')}
              variant="ghost"
              size="icon-sm"
              render={<Link to={`/orders/${row.id}`} />}
            >
              <Eye />
            </IconButton>
          )}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getOrdersReport,
  type ReportFilters,
  type ReportRow,
} from '@/api/reports';
import {
  useOrderStatuses,
  useClients,
  useSalesChannels,
} from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
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

function formatMinutes(mins: number | null): string {
  if (mins === null || mins === undefined) return '—';
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const { query: statusesQuery } = useOrderStatuses();
  const statuses = statusesQuery.data;
  const { query: clientsQuery } = useClients();
  const { query: channelsQuery } = useSalesChannels();
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';

  const activeFilters: ReportFilters = {
    ...filters,
    ...(statusFilter ? { status_id: statusFilter } : {}),
    ...(clientFilter ? { client_id: clientFilter } : {}),
    ...(channelFilter ? { sales_channel_id: channelFilter } : {}),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', activeFilters],
    queryFn: () => getOrdersReport(activeFilters),
    enabled: true,
  });

  const handleApply = () => {
    refetch();
  };

  const columns: Column<ReportRow>[] = [
    {
      header: 'ID',
      accessor: (row) => `#${row.id.slice(0, 8)}`,
      sortable: false,
    },
    {
      header: 'Order Date',
      accessor: (row) => new Date(row.order_date).toLocaleDateString(),
      sortValue: (row) => row.order_date,
    },
    { header: 'Client', accessor: 'client_name' },
    { header: 'Phone', accessor: 'client_phone' },
    { header: 'Items', accessor: 'items_count' },
    {
      header: `Total (${currency})`,
      accessor: (row) =>
        row.total.toLocaleString('uk-UA', { minimumFractionDigits: 2 }),
      sortValue: (row) => row.total,
      totalValue: (rows) =>
        rows
          .reduce((sum, r) => sum + r.total, 0)
          .toLocaleString('uk-UA', { minimumFractionDigits: 2 }),
    },
    { header: 'Channel', accessor: 'sales_channel_name' },
    {
      header: 'Status',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`inline-block size-2 rounded-full ${STATUS_COLORS[row.status_name] ?? 'bg-gray-400'}`}
          />
          {row.status_name}
        </span>
      ),
      sortValue: (row) => row.status_name,
    },
    { header: 'Accepted By', accessor: (row) => row.accepted_by_name ?? '—' },
    {
      header: 'Time Since Creation',
      accessor: (row) => formatMinutes(row.time_since_creation),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Reports</h1>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">From</span>
          <Input
            type="date"
            className="w-40"
            value={filters.date_from ?? ''}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                date_from: e.target.value || undefined,
              }))
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">To</span>
          <Input
            type="date"
            className="w-40"
            value={filters.date_to ?? ''}
            onChange={(e) =>
              setFilters((p) => ({
                ...p,
                date_to: e.target.value || undefined,
              }))
            }
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status">
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

        <Select
          value={clientFilter}
          onValueChange={(val) => setClientFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Client">
              {clientFilter
                ? clientsQuery.data?.find((c) => c.id === clientFilter)?.name
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All clients</SelectItem>
            {clientsQuery.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={channelFilter}
          onValueChange={(val) =>
            setChannelFilter(val === '__all__' ? '' : val)
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Channel">
              {channelFilter
                ? channelsQuery.data?.find((ch) => ch.id === channelFilter)
                    ?.name
                : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All channels</SelectItem>
            {channelsQuery.data?.map((ch) => (
              <SelectItem key={ch.id} value={ch.id}>
                {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" onClick={handleApply}>
          Apply
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && <DataTable columns={columns} data={data} />}
      {!data && !isLoading && !error && (
        <p className="text-muted-foreground">Apply filters to see the report</p>
      )}
    </div>
  );
}

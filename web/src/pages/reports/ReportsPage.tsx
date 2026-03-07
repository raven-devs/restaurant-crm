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

function formatMinutes(mins: number | null): string {
  if (mins === null || mins === undefined) return '—';
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

const columns: Column<ReportRow>[] = [
  {
    header: 'Date',
    accessor: (row) => new Date(row.order_date).toLocaleDateString(),
  },
  { header: 'Client', accessor: 'client_name' },
  { header: 'Phone', accessor: 'client_phone' },
  { header: 'Items', accessor: 'items_count' },
  { header: 'Channel', accessor: 'sales_channel_name' },
  { header: 'Status', accessor: 'status_name' },
  { header: 'Accepted By', accessor: (row) => row.accepted_by_name ?? '—' },
  {
    header: 'Time Since Creation',
    accessor: (row) => formatMinutes(row.time_since_creation),
  },
];

export function ReportsPage() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');

  const { data: statuses } = useOrderStatuses();
  const { query: clientsQuery } = useClients();
  const { query: channelsQuery } = useSalesChannels();

  const activeFilters: ReportFilters = {
    ...filters,
    ...(statusFilter ? { status_id: statusFilter } : {}),
    ...(clientFilter ? { client_id: clientFilter } : {}),
    ...(channelFilter ? { sales_channel_id: channelFilter } : {}),
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', activeFilters],
    queryFn: () => getOrdersReport(activeFilters),
    enabled: false,
  });

  const handleApply = () => {
    refetch();
  };

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
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
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

        <Select
          value={clientFilter}
          onValueChange={(val) => setClientFilter(val === '__all__' ? '' : val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Client" />
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
            <SelectValue placeholder="Channel" />
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

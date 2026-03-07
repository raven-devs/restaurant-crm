import { useOrderStatuses } from '@/hooks/useReferences';
import type { Column } from '@/components/DataTable';
import type { OrderStatus } from '@/api/references';
import { DataTable } from '@/components/DataTable';

const columns: Column<OrderStatus>[] = [
  { header: 'Status', accessor: 'name' },
  { header: 'Previous', accessor: (row) => row.previous_status ?? '—' },
  { header: 'Next', accessor: (row) => row.next_status ?? '—' },
  {
    header: 'Max Unconfirmed (min)',
    accessor: (row) => row.max_time_without_confirmation ?? '—',
  },
  {
    header: 'Max In Status (min)',
    accessor: (row) => row.max_time_in_status ?? '—',
  },
  { header: 'Escalation', accessor: (row) => row.escalation ?? '—' },
];

export function OrderStatusesPage() {
  const { data, isLoading, error } = useOrderStatuses();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Order Statuses</h1>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {data && <DataTable columns={columns} data={data} />}
    </div>
  );
}

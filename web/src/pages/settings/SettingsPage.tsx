import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { useOrderStatuses } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Column } from '@/components/DataTable';
import type { OrderStatus } from '@/api/references';

const currencies = ['UAH', 'USD', 'EUR'];

const escalationLabels: Record<string, string> = {
  send_telegram_alert: 'Telegram Alert',
  notify_manager: 'Telegram Manager Alert',
  auto_escalate: 'Telegram Escalation',
  none: 'None',
};

const statusColumns: Column<OrderStatus>[] = [
  { header: 'Status', accessor: 'name', sortable: false },
  {
    header: 'Previous',
    accessor: (row) => row.previous_status_name ?? '—',
    sortable: false,
  },
  {
    header: 'Next',
    accessor: (row) => row.next_status_name ?? '—',
    sortable: false,
  },
  {
    header: 'Max Unconfirmed (min)',
    accessor: (row) => row.max_time_unconfirmed ?? '—',
    sortable: false,
  },
  {
    header: 'Max In Status (min)',
    accessor: (row) => row.max_time_in_status ?? '—',
    sortable: false,
  },
  {
    header: 'Escalation',
    accessor: (row) =>
      escalationLabels[row.escalation_action ?? ''] ??
      row.escalation_action ??
      '—',
    sortable: false,
  },
];

const statusFields: FieldDef[] = [
  {
    name: 'max_time_unconfirmed',
    label: 'Max Unconfirmed (min)',
    description:
      'Maximum time (in minutes) an order can stay in this status without being acknowledged. Triggers escalation if exceeded.',
    type: 'number',
    required: false,
  },
  {
    name: 'max_time_in_status',
    label: 'Max In Status (min)',
    description:
      'Maximum time (in minutes) an order can remain in this status before it is considered overdue.',
    type: 'number',
    required: false,
  },
  {
    name: 'escalation_action',
    label: 'Escalation Action',
    description: 'Action taken when the time limit is exceeded.',
    type: 'select',
    options: [
      { value: 'send_telegram_alert', label: 'Telegram Alert' },
      { value: 'notify_manager', label: 'Telegram Manager Alert' },
      { value: 'auto_escalate', label: 'Telegram Escalation' },
      { value: 'none', label: 'None' },
    ],
    required: false,
  },
];

export function SettingsPage() {
  const { settings, update } = useSettings();
  const { query: statusQuery, update: statusUpdate } = useOrderStatuses();

  const handleCurrencyChange = (value: string) => {
    update.mutate(
      { currency: value },
      {
        onSuccess: () => toast.success('Currency updated'),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-xs flex-col gap-1.5">
            <Label>Currency</Label>
            <Select
              value={settings?.currency ?? 'UAH'}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <EntityPage
        title="Order Statuses"
        query={statusQuery}
        columns={statusColumns}
        fields={statusFields}
        updateMutation={statusUpdate}
      />
    </div>
  );
}

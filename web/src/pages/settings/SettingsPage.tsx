import * as Sentry from '@sentry/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
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

export function SettingsPage() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();
  const { query: statusQuery, update: statusUpdate } = useOrderStatuses();

  const escalationLabels: Record<string, string> = {
    send_telegram_alert: t('settings.telegramAlert'),
    notify_manager: t('settings.telegramManagerAlert'),
    auto_escalate: t('settings.telegramEscalation'),
    none: t('settings.none'),
  };

  const statusColumns: Column<OrderStatus>[] = [
    { header: t('settings.status'), accessor: 'name', sortable: false },
    {
      header: t('settings.previous'),
      accessor: (row) => row.previous_status_name ?? '—',
      sortable: false,
    },
    {
      header: t('settings.next'),
      accessor: (row) => row.next_status_name ?? '—',
      sortable: false,
    },
    {
      header: t('settings.maxUnconfirmed'),
      accessor: (row) => row.max_time_unconfirmed ?? '—',
      sortable: false,
    },
    {
      header: t('settings.maxInStatus'),
      accessor: (row) => row.max_time_in_status ?? '—',
      sortable: false,
    },
    {
      header: t('settings.escalation'),
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
      label: t('settings.maxUnconfirmed'),
      description: t('settings.maxUnconfirmedDesc'),
      type: 'number',
      required: false,
    },
    {
      name: 'max_time_in_status',
      label: t('settings.maxInStatus'),
      description: t('settings.maxInStatusDesc'),
      type: 'number',
      required: false,
    },
    {
      name: 'escalation_action',
      label: t('settings.escalationAction'),
      description: t('settings.escalationActionDesc'),
      type: 'select',
      options: [
        { value: 'send_telegram_alert', label: t('settings.telegramAlert') },
        {
          value: 'notify_manager',
          label: t('settings.telegramManagerAlert'),
        },
        { value: 'auto_escalate', label: t('settings.telegramEscalation') },
        { value: 'none', label: t('settings.none') },
      ],
      required: false,
    },
  ];

  const handleCurrencyChange = (value: string) => {
    update.mutate(
      { currency: value },
      {
        onSuccess: () => toast.success(t('settings.currencyUpdated')),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.general')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-w-xs flex-col gap-1.5">
            <Label>{t('settings.currency')}</Label>
            <Select
              value={settings?.currency ?? 'UAH'}
              onValueChange={(val) => {
                if (val != null) handleCurrencyChange(val);
              }}
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

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.sentry')}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Sentry.captureMessage('Test debug event from FE', 'debug');
              toast.success(t('settings.sentryEventSent', { type: 'debug' }));
            }}
          >
            {t('settings.sendDebugEvent')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              Sentry.captureException(new Error('Test error from FE'));
              toast.success(t('settings.sentryEventSent', { type: 'error' }));
            }}
          >
            {t('settings.sendErrorEvent')}
          </Button>
        </CardContent>
      </Card>

      <EntityPage
        title={t('settings.orderStatuses')}
        query={statusQuery}
        columns={statusColumns}
        fields={statusFields}
        updateMutation={statusUpdate}
      />
    </div>
  );
}

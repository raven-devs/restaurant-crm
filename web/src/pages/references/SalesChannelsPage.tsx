import { useTranslation } from 'react-i18next';
import { useSalesChannels } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { SalesChannel } from '@/api/references';

export function SalesChannelsPage() {
  const { t } = useTranslation();
  const { query, create, update, remove } = useSalesChannels();

  const columns: Column<SalesChannel>[] = [
    { header: t('common.name'), accessor: 'name' },
  ];

  const fields: FieldDef[] = [{ name: 'name', label: t('common.name') }];

  return (
    <EntityPage
      title={t('references.salesChannels')}
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      exportFilename="sales-channels"
      createLabel={t('references.newChannel')}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

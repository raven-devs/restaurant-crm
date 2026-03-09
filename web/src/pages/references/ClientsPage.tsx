import { useTranslation } from 'react-i18next';
import { useClients } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Client } from '@/api/references';

export function ClientsPage() {
  const { t } = useTranslation();
  const { query, create, update, remove } = useClients();

  const columns: Column<Client>[] = [
    { header: t('common.name'), accessor: 'name' },
    { header: t('common.phone'), accessor: 'phone' },
  ];

  const fields: FieldDef[] = [
    { name: 'name', label: t('common.name') },
    { name: 'phone', label: t('common.phone'), type: 'tel' },
  ];

  return (
    <EntityPage
      title={t('references.clients')}
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      exportFilename="clients"
      createLabel={t('references.newClient')}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

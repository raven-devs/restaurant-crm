import { useClients } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Client } from '@/api/references';

const columns: Column<Client>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Phone', accessor: 'phone' },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Name' },
  { name: 'phone', label: 'Phone', type: 'tel' },
];

export function ClientsPage() {
  const { query, create, update, remove } = useClients();

  return (
    <EntityPage
      title="Clients"
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

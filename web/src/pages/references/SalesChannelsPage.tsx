import { useSalesChannels } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { SalesChannel } from '@/api/references';

const columns: Column<SalesChannel>[] = [{ header: 'Name', accessor: 'name' }];

const fields: FieldDef[] = [{ name: 'name', label: 'Name' }];

export function SalesChannelsPage() {
  const { query, create, update, remove } = useSalesChannels();

  return (
    <EntityPage
      title="Sales Channels"
      query={query}
      columns={columns}
      fields={fields}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

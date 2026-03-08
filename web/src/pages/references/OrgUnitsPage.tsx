import { useOrgUnits } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { OrgUnit } from '@/api/references';

const columns: Column<OrgUnit>[] = [{ header: 'Name', accessor: 'name' }];

const fields: FieldDef[] = [{ name: 'name', label: 'Name' }];

export function OrgUnitsPage() {
  const { query, create, update, remove } = useOrgUnits();

  return (
    <EntityPage
      title="Org Structure"
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

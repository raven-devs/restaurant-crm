import { useMemo } from 'react';
import { useEmployees, useOrgUnits } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Employee } from '@/api/references';

const columns: Column<Employee>[] = [
  { header: 'Name', accessor: 'name' },
  {
    header: 'Department',
    accessor: (row) => row.org_unit?.name ?? '—',
    sortValue: (row) => row.org_unit?.name ?? '',
  },
];

export function EmployeesPage() {
  const { query, create, update, remove } = useEmployees();
  const { query: orgUnitsQuery } = useOrgUnits();

  const fields: FieldDef[] = useMemo(
    () => [
      { name: 'name', label: 'Name' },
      {
        name: 'org_unit_id',
        label: 'Department',
        type: 'select' as const,
        options:
          orgUnitsQuery.data?.map((u) => ({ value: u.id, label: u.name })) ??
          [],
      },
    ],
    [orgUnitsQuery.data],
  );

  return (
    <EntityPage
      title="Employees"
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

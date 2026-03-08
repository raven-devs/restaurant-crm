import { useMemo } from 'react';
import { useEmployees, useOrgUnits } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Employee } from '@/api/references';

const columns: Column<Employee>[] = [
  { header: 'Name', accessor: 'name' },
  {
    header: 'Email',
    accessor: (row) => row.email ?? '—',
    csvValue: (row) => row.email ?? '',
    sortValue: (row) => row.email ?? '',
  },
  {
    header: 'Department',
    accessor: (row) => row.org_unit?.name ?? '—',
    csvValue: (row) => row.org_unit?.name ?? '',
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
      { name: 'email', label: 'Email', required: false },
      {
        name: 'password',
        label: 'Password',
        type: 'password' as const,
        editDescription: 'Leave empty to keep current password',
        required: false,
        requiredOnCreate: true,
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
      exportFilename="employees"
      createLabel="New Employee"
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

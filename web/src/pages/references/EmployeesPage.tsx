import { useEmployees } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Employee } from '@/api/references';

const columns: Column<Employee>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Department', accessor: 'department' },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Name' },
  { name: 'department', label: 'Department' },
];

export function EmployeesPage() {
  const { query, create, update, remove } = useEmployees();

  return (
    <EntityPage
      title="Employees"
      query={query}
      columns={columns}
      fields={fields}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

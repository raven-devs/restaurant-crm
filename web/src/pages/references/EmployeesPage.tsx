import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEmployees, useOrgUnits } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { Employee } from '@/api/references';

export function EmployeesPage() {
  const { t } = useTranslation();
  const { query, create, update, remove } = useEmployees();
  const { query: orgUnitsQuery } = useOrgUnits();

  const columns: Column<Employee>[] = [
    { header: t('common.name'), accessor: 'name' },
    {
      header: t('common.email'),
      accessor: (row) => row.email ?? '—',
      csvValue: (row) => row.email ?? '',
      sortValue: (row) => row.email ?? '',
    },
    {
      header: t('references.department'),
      accessor: (row) => row.org_unit?.name ?? '—',
      csvValue: (row) => row.org_unit?.name ?? '',
      sortValue: (row) => row.org_unit?.name ?? '',
    },
  ];

  const fields: FieldDef[] = useMemo(
    () => [
      { name: 'name', label: t('common.name') },
      {
        name: 'org_unit_id',
        label: t('references.department'),
        type: 'select' as const,
        options:
          orgUnitsQuery.data?.map((u) => ({ value: u.id, label: u.name })) ??
          [],
      },
      { name: 'email', label: t('common.email'), required: false },
      {
        name: 'password',
        label: t('common.password'),
        type: 'password' as const,
        editDescription: t('references.passwordHint'),
        required: false,
        requiredOnCreate: true,
      },
    ],
    [orgUnitsQuery.data, t],
  );

  return (
    <EntityPage
      title={t('references.employees')}
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      exportFilename="employees"
      createLabel={t('references.newEmployee')}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

import { useTranslation } from 'react-i18next';
import { useOrgUnits } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { OrgUnit } from '@/api/references';

export function OrgUnitsPage() {
  const { t } = useTranslation();
  const { query, create, update, remove } = useOrgUnits();

  const columns: Column<OrgUnit>[] = [
    { header: t('common.name'), accessor: 'name' },
  ];

  const fields: FieldDef[] = [{ name: 'name', label: t('common.name') }];

  return (
    <EntityPage
      title={t('references.orgStructure')}
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      exportFilename="org-structure"
      createLabel={t('references.newUnit')}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

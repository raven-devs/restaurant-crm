import { useTranslation } from 'react-i18next';
import { useNomenclature } from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { NomenclatureItem } from '@/api/references';

export function NomenclaturePage() {
  const { t } = useTranslation();
  const { query, create, update, remove } = useNomenclature();
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';

  const columns: Column<NomenclatureItem>[] = [
    { header: t('common.name'), accessor: 'name' },
    {
      header: t('references.price', { currency }),
      accessor: (row) => row.price.toFixed(2),
      csvValue: (row) => row.price,
      sortValue: (row) => row.price,
    },
  ];

  const fields: FieldDef[] = [
    { name: 'name', label: t('common.name') },
    {
      name: 'price',
      label: t('references.price', { currency }),
      type: 'number',
    },
  ];

  return (
    <EntityPage
      title={t('references.nomenclature')}
      query={query}
      columns={columns}
      fields={fields}
      searchField="name"
      exportFilename="nomenclature"
      createLabel={t('references.newItem')}
      createMutation={create}
      updateMutation={update}
      deleteMutation={remove}
    />
  );
}

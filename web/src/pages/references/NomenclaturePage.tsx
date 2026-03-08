import { useNomenclature } from '@/hooks/useReferences';
import { useSettings } from '@/hooks/useSettings';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { NomenclatureItem } from '@/api/references';

export function NomenclaturePage() {
  const { query, create, update, remove } = useNomenclature();
  const { settings } = useSettings();
  const currency = settings?.currency ?? 'UAH';

  const columns: Column<NomenclatureItem>[] = [
    { header: 'Name', accessor: 'name' },
    {
      header: `Price (${currency})`,
      accessor: (row) => row.price.toFixed(2),
      sortValue: (row) => row.price,
    },
  ];

  const fields: FieldDef[] = [
    { name: 'name', label: 'Name' },
    { name: 'price', label: `Price (${currency})`, type: 'number' },
  ];

  return (
    <EntityPage
      title="Nomenclature"
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

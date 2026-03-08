import { useNomenclature } from '@/hooks/useReferences';
import { EntityPage, type FieldDef } from '@/components/EntityPage';
import type { Column } from '@/components/DataTable';
import type { NomenclatureItem } from '@/api/references';

const columns: Column<NomenclatureItem>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Price (UAH)', accessor: (row) => row.price.toFixed(2) },
];

const fields: FieldDef[] = [
  { name: 'name', label: 'Name' },
  { name: 'price', label: 'Price (UAH)', type: 'number' },
];

export function NomenclaturePage() {
  const { query, create, update, remove } = useNomenclature();

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

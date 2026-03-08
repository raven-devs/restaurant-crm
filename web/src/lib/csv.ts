import type { Column } from '@/components/DataTable';

function escapeCsvField(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCSV<T extends { id: string }>(
  columns: Column<T>[],
  data: T[],
  filename: string,
): void {
  const exportable = columns.filter(
    (col) => col.csvValue || typeof col.accessor === 'string',
  );

  if (exportable.length === 0) return;

  const header = exportable.map((col) => escapeCsvField(col.header));

  const rows = data.map((row) =>
    exportable.map((col) => {
      let value: string | number | null;
      if (col.csvValue) {
        value = col.csvValue(row);
      } else {
        value = row[col.accessor as keyof T] as string | number | null;
      }
      if (value === null || value === undefined) return '';
      return escapeCsvField(String(value));
    }),
  );

  const BOM = '\uFEFF';
  const csv = BOM + [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

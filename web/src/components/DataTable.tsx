import { useState, useMemo } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  totalValue?: (rows: T[]) => React.ReactNode;
  csvValue?: (row: T) => string | number | null;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: (row: T) => React.ReactNode;
  pageSize?: number;
}

type SortDir = 'asc' | 'desc';

export function DataTable<T extends { id: string }>({
  columns,
  data,
  actions,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  const toggleSort = (header: string) => {
    if (sortCol === header) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(header);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sortedData = useMemo(() => {
    if (!sortCol) return data;
    const col = columns.find((c) => c.header === sortCol);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let va: string | number;
      let vb: string | number;

      if (col.sortValue) {
        va = col.sortValue(a);
        vb = col.sortValue(b);
      } else if (typeof col.accessor === 'function') {
        return 0;
      } else {
        va = String(a[col.accessor] ?? '');
        vb = String(b[col.accessor] ?? '');
      }

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortCol, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeePage = Math.min(page, totalPages - 1);
  const pagedData = sortedData.slice(
    safeePage * pageSize,
    (safeePage + 1) * pageSize,
  );

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => {
              const isSortable =
                col.sortable ??
                (typeof col.accessor !== 'function' || !!col.sortValue);

              return (
                <TableHead
                  key={col.header}
                  className={`${col.className ?? ''} ${isSortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={
                    isSortable ? () => toggleSort(col.header) : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {isSortable &&
                      (sortCol === col.header ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 text-muted-foreground" />
                      ))}
                  </span>
                </TableHead>
              );
            })}
            {actions && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center text-muted-foreground"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            pagedData.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.header} className={col.className}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(row)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
        {sortedData.length > 0 && columns.some((c) => c.totalValue) && (
          <TableFooter>
            <TableRow className="font-semibold">
              {columns.map((col) => (
                <TableCell key={col.header} className={col.className}>
                  {col.totalValue ? col.totalValue(sortedData) : null}
                </TableCell>
              ))}
              {actions && <TableCell />}
            </TableRow>
          </TableFooter>
        )}
      </Table>

      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          {totalPages > 1 ? (
            <>
              {safeePage * pageSize + 1}–
              {Math.min((safeePage + 1) * pageSize, sortedData.length)} of{' '}
              {sortedData.length}
            </>
          ) : (
            <>{sortedData.length} total</>
          )}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safeePage === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              {safeePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-xs"
              disabled={safeePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

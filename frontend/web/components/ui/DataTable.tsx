import React from 'react';
import { Loader2, Database } from 'lucide-react';
import { Pagination } from './Pagination';
import { PageEmpty } from './PageEmpty';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  pageIndex: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  columns,
  data,
  pageIndex,
  totalPages,
  onPageChange,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyDescription = 'There are currently no records to display.',
}: DataTableProps<T>) {
  const isEmpty = !isLoading && data.length === 0;

  if (isEmpty) {
    return (
      <div className="w-full rounded-lg border border-border bg-surface px-4 py-8 shadow-sm sm:px-6">
        <div className="flex min-h-[240px] flex-col items-center justify-center sm:min-h-[300px]">
          <PageEmpty
            icon={Database}
            title={emptyMessage}
            description={emptyDescription}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="relative min-h-[150px] overflow-x-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/70 px-4 backdrop-blur-[1px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <table className="w-full min-w-[640px] divide-y divide-border">
          <thead className="bg-surfaceVariant">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-textSecondary sm:px-6 sm:py-4 sm:text-xs"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border bg-surface">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors duration-150 hover:bg-surfaceVariant/70"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="align-top px-4 py-3 text-sm text-textPrimary sm:px-6 sm:py-4"
                  >
                    <div className="max-w-[280px] truncate sm:max-w-none">
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? (row[col.accessorKey] as React.ReactNode)
                          : null}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-surface px-2 py-3 sm:px-4">
        <Pagination
          pageIndex={pageIndex}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
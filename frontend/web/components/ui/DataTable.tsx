import React from 'react';
import { Pagination } from './Pagination';
import { Loader2, Database } from 'lucide-react';
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
    emptyMessage = "No data found",
    emptyDescription = "There are currently no records to display."
}: DataTableProps<T>) {

    if (!isLoading && data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow border border-border px-4 py-8 sm:p-6 flex flex-col items-center justify-center min-h-[240px] sm:min-h-[300px]">
                <PageEmpty icon={Database} title={emptyMessage} description={emptyDescription} />
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg border border-border overflow-hidden w-full">
            <div className="relative min-h-[150px] overflow-x-auto">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center px-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
                <table className="min-w-[640px] w-full divide-y divide-border">
                    <thead className="bg-surfaceVariant">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className="px-4 sm:px-6 py-3 sm:py-4 text-left text-[11px] sm:text-xs font-semibold text-textSecondary uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-border">
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-surfaceVariant/70 transition-colors duration-150">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-textPrimary align-top">
                                        {col.cell 
                                            ? col.cell(row) 
                                            : col.accessorKey 
                                                ? (row[col.accessorKey] as React.ReactNode) 
                                                : null
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Pagination
                pageIndex={pageIndex}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}

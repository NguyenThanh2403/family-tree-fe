import * as React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-neutral-200', className)}>
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 font-semibold text-neutral-600 border-b border-neutral-200',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Loader2 className="animate-spin mx-auto text-neutral-400" size={24} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-neutral-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-neutral-100 last:border-0',
                  'transition-colors hover:bg-neutral-50',
                  onRowClick && 'cursor-pointer',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-4 py-3 text-neutral-800', col.className)}
                  >
                    {col.render
                      ? col.render((row as Record<string, unknown>)[col.key], row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

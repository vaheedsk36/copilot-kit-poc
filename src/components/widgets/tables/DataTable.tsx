import React, { memo } from 'react';
import { formatWidgetValue } from '../../core/ui/utils';
import BaseWidget from '../shared/BaseWidget';
import type { TableWidget, WidgetRendererProps } from '../shared/types';

interface DataTableProps extends WidgetRendererProps<TableWidget> {
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

const DataTableContent: React.FC<{
  data: TableWidget['data'];
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}> = memo(({
  data,
  striped = false,
  hover = true,
  compact = false
}) => {
  const { title, columns, rows } = data;

  const tableClasses = 'w-full';
  const headerClasses = 'bg-gray-50';
  const thClasses = 'px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider';
  const tbodyClasses = 'bg-white divide-y divide-gray-200';
  const rowClasses = hover ? 'hover:bg-gray-50 transition-colors duration-150' : '';
  const cellClasses = compact ? 'px-4 py-2' : 'px-6 py-4';
  const tdClasses = `whitespace-nowrap text-sm text-gray-900 ${cellClasses}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {title && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          <thead className={headerClasses}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={thClasses}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={tbodyClasses}>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${cellClasses} text-center text-gray-500`}
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${rowClasses} ${striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={tdClasses}
                    >
                      {formatWidgetValue(row[column.key], column.type)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

DataTableContent.displayName = 'DataTableContent';

const DataTable: React.FC<DataTableProps> = memo(({
  widget,
  striped,
  hover,
  compact,
  ...baseProps
}) => {
  return (
    <BaseWidget widget={widget} {...baseProps}>
      <DataTableContent
        data={widget.data}
        striped={striped}
        hover={hover}
        compact={compact}
      />
    </BaseWidget>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;

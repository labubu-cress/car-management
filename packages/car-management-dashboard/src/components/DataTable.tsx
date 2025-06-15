import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import * as styles from './DataTable.css';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  addButtonText?: string;
  title?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = '添加',
  title,
}: DataTableProps<T>) {
  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record as any);
    }
    return record[key as keyof T];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {onAdd && (
          <button onClick={onAdd} className={styles.addButton}>
            <FontAwesomeIcon icon={faPlus} className={styles.buttonIcon} />
            {addButtonText}
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={styles.th}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className={styles.th} style={{ width: '120px' }}>
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className={styles.loadingCell}
                >
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className={styles.emptyCell}
                >
                  暂无数据
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className={styles.tr}>
                  {columns.map((column, index) => (
                    <td key={index} className={styles.td}>
                      {column.render
                        ? column.render(getValue(record, column.key), record)
                        : getValue(record, column.key)}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className={styles.editButton}
                            title="编辑"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(record)}
                            className={styles.deleteButton}
                            title="删除"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
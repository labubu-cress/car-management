import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faEdit, faEye, faEyeSlash, faGripVertical, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import * as styles from './DataTable.css';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface Action<T> {
  label: string;
  onClick: (record: T) => void;
  isDanger?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onArchiveToggle?: (record: T) => void;
  getActions?: (record: T) => Action<T>[];
  addButtonText?: string;
  title?: string;
  onReorder?: (data: T[]) => void;
}

function SortableRow<T extends { id: string; isArchived?: boolean }>({
  record,
  columns,
  onEdit,
  onDelete,
  onArchiveToggle,
  getActions,
  getValue,
  isSortable,
}: {
  record: T;
  columns: Column<T>[];
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onArchiveToggle?: (record: T) => void;
  getActions?: (record: T) => Action<T>[];
  getValue: (record: T, key: keyof T | string) => any;
  isSortable: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: record.id,
    disabled: !isSortable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  };

  const actions = getActions ? getActions(record) : [];

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className={styles.tr}>
      {isSortable && (
        <td className={styles.td} style={{ width: '40px', cursor: 'grab' }} {...listeners}>
          <FontAwesomeIcon icon={faGripVertical} />
        </td>
      )}
      {columns.map((column, index) => (
        <td key={index} className={styles.td}>
          {column.render ? column.render(getValue(record, column.key), record) : getValue(record, column.key)}
        </td>
      ))}
      {(onEdit || onDelete || onArchiveToggle || (actions && actions.length > 0)) && (
        <td className={styles.td}>
          <div className={styles.actions}>
            {getActions
              ? actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.onClick(record)}
                    className={
                      action.isDanger
                        ? styles.actionButtonDanger
                        : styles.actionButton
                    }
                    title={action.label}
                  >
                    {action.label}
                  </button>
                ))
              : null}

            {!getActions && onArchiveToggle && (
              <button
                onClick={() => onArchiveToggle?.(record)}
                className={record.isArchived ? styles.unarchiveButton : styles.archiveButton}
                title={record.isArchived ? '上架' : '下架'}
              >
                <FontAwesomeIcon icon={record.isArchived ? faEye : faEyeSlash} />
              </button>
            )}

            {!getActions && onEdit && (
              <button
                onClick={() => onEdit?.(record)}
                className={styles.editButton}
                title="编辑"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            )}
            {!getActions && onDelete && (
              <button
                onClick={() => onDelete?.(record)}
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
  );
}

export function DataTable<T extends { id: string; isArchived?: boolean }>({
  columns,
  data,
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onArchiveToggle,
  getActions,
  addButtonText = '添加',
  title,
  onReorder,
}: DataTableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getValue = (record: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record as any);
    }
    return record[key as keyof T];
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      onReorder?.(arrayMove(data, oldIndex, newIndex));
    }
  }

  const isSortable = !!onReorder;
  const hasActions =
    !!onEdit || !!onDelete || (data.length > 0 && !!getActions);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                {isSortable && <th className={styles.th} style={{ width: '40px' }} />}
                {columns.map((column, index) => (
                  <th key={index} className={styles.th} style={{ width: column.width }}>
                    {column.title}
                  </th>
                ))}
                {hasActions && (
                  <th className={styles.th} style={{ width: '180px' }}>
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <SortableContext items={data.map((d) => d.id)} strategy={verticalListSortingStrategy} disabled={!isSortable}>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + (hasActions ? 1 : 0) + (isSortable ? 1 : 0)}
                      className={styles.loadingCell}
                    >
                      加载中...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (hasActions ? 1 : 0) + (isSortable ? 1 : 0)}
                      className={styles.emptyCell}
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  data.map((record) => (
                    <SortableRow
                      key={record.id}
                      record={record}
                      columns={columns}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onArchiveToggle={onArchiveToggle}
                      getActions={getActions}
                      getValue={getValue}
                      isSortable={isSortable}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </div>
    </DndContext>
  );
} 
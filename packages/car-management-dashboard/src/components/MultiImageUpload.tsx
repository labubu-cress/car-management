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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import toast from 'react-hot-toast';
import { ImageUpload } from './ImageUpload';
import { multiUploadStyles } from './MultiImageUpload.css';

// --- Start of SortableImageItem ---
interface SortableImageItemProps {
  url: string;
  tenantId: string;
  onRemove: (url: string) => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ url, tenantId, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={multiUploadStyles.item}>
      <ImageUpload value={url} onChange={() => {}} tenantId={tenantId} />
      <button
        type="button"
        className={multiUploadStyles.deleteButton}
        onClick={(e) => {
          e.stopPropagation(); // Prevent dnd listeners from firing
          onRemove(url);
        }}
      >
        &times;
      </button>
    </div>
  );
};
// --- End of SortableImageItem ---


interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  tenantId: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ values, onChange, tenantId }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddImage = (url: string) => {
    if (values.includes(url)) {
      toast.error('图片已存在，请勿重复添加');
      return;
    }
    onChange([...values, url]);
  };

  const handleRemoveImage = (urlToRemove: string) => {
    onChange(values.filter(url => url !== urlToRemove));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = values.findIndex(url => url === active.id);
      const newIndex = values.findIndex(url => url === over.id);
      onChange(arrayMove(values, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={values} strategy={rectSortingStrategy}>
        <div className={multiUploadStyles.container}>
          {values.map((url) => (
            <SortableImageItem key={url} url={url} tenantId={tenantId} onRemove={handleRemoveImage} />
          ))}
          <div className={multiUploadStyles.addButton}>
            <ImageUpload value={null} onChange={handleAddImage} tenantId={tenantId} />
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}; 
import { CarCategory } from '@/types/api';
import React from 'react';

interface CarTrimsHeaderProps {
  categories: CarCategory[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
  statusFilter: 'all' | 'archived' | 'active';
  onStatusFilterChange: (status: 'all' | 'archived' | 'active') => void;
}

export const CarTrimsHeader: React.FC<CarTrimsHeaderProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            选择车型：
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px',
              outline: 'none',
            }}
            disabled={categories.length <= 1}
          >
            {categories.length > 1 && <option value="">请选择车型</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            状态筛选：
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            style={{
              padding: '8px 32px 8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px',
              outline: 'none',
            }}
          >
            <option value="all">全部</option>
            <option value="active">销售中</option>
            <option value="archived">已下架</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 
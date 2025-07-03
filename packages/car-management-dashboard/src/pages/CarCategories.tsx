import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { CarCategory } from '@/types/api';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarCategories } from './CarCategories.hooks';
import { columns } from './CarCategoriesColumns';

export const CarCategories: React.FC = () => {
  const navigate = useNavigate();
  const {
    isViewer,
    scenarios,
    selectedScenarioId,
    setSelectedScenarioId,
    isLoading,
    localCategories,
    handleReorder,
    handleDelete,
    handleArchiveToggle,
  } = useCarCategories();

  const handleAdd = () => {
    navigate('/car-categories/new');
  };

  const handleEdit = (category: CarCategory) => {
    navigate(`/car-categories/${category.id}/edit`);
  };

  if (scenarios.length === 0) {
    return (
      <EmptyState
        title="还没有车辆分类"
        description={isViewer ? '请联系管理员创建车辆分类' : '创建车型前，需要先创建车辆分类。车型必须归属于某个分类。'}
        actionLabel={isViewer ? undefined : '创建车辆分类'}
        onAction={isViewer ? undefined : () => navigate('/vehicle-scenarios')}
        icon={<FontAwesomeIcon icon={faStream} />}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          选择车辆分类：
        </label>
        <select
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          style={{
            padding: '8px 32px 8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px',
            outline: 'none',
          }}
          disabled={scenarios.length <= 1}
        >
          {scenarios.length > 1 && <option value="">请选择分类</option>}
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        title="车型管理"
        data={localCategories}
        columns={columns}
        loading={isLoading}
        onAdd={selectedScenarioId && !isViewer ? handleAdd : undefined}
        onEdit={!isViewer ? handleEdit : undefined}
        onDelete={!isViewer ? handleDelete : undefined}
        onArchiveToggle={!isViewer ? handleArchiveToggle : undefined}
        onReorder={!isViewer ? handleReorder : undefined}
        addButtonText="创建车型"
      />
    </div>
  );
}; 
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarTrims } from './CarTrims.hooks';
import { columns } from './CarTrimsColumns';
import { CarTrimsHeader } from './CarTrimsHeader';

export const CarTrims: React.FC = () => {
  const navigate = useNavigate();
  const {
    isViewer,
    selectedCategoryId,
    setSelectedCategoryId,
    statusFilter,
    setStatusFilter,
    categories,
    isLoading,
    filteredTrims,
    handleAdd,
    handleReorder,
    getActions,
    scenarios,
    selectedScenarioId,
    setSelectedScenarioId,
  } = useCarTrims();

  if (categories.length === 0) {
    return (
      <EmptyState
        title="还没有车型"
        description={isViewer ? '请联系管理员创建车型' : '创建车型参数前，需要先创建车型。车型参数必须归属于某个车型。'}
        actionLabel={isViewer ? undefined : '创建车型'}
        onAction={isViewer ? undefined : () => navigate('/car-categories')}
        icon={<FontAwesomeIcon icon={faCar} />}
      />
    );
  }

  return (
    <div>
      <CarTrimsHeader
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onScenarioChange={setSelectedScenarioId}
      />

      <DataTable
        title="车型参数管理"
        columns={columns}
        data={filteredTrims}
        loading={isLoading}
        addButtonText="创建车型参数"
        onAdd={selectedCategoryId && !isViewer ? handleAdd : undefined}
        onReorder={isViewer ? undefined : handleReorder}
        getActions={isViewer ? () => [] : getActions}
      />
    </div>
  );
}; 
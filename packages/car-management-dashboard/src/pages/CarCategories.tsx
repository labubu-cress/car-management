import { Column, DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, vehicleScenariosApi } from '@/lib/api';
import { CarCategory } from '@/types/api';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export const CarCategories: React.FC = () => {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');

  const { data: scenarios = [] } = useQuery(
    ['vehicle-scenarios', currentTenant?.id],
    () => (currentTenant ? vehicleScenariosApi.getAll(currentTenant.id) : Promise.resolve([])),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !selectedScenarioId) {
          setSelectedScenarioId(data[0].id);
        }
      },
    }
  );

  const { data: categories = [], isLoading } = useQuery(
    ['car-categories', currentTenant?.id, selectedScenarioId],
    () =>
      currentTenant && selectedScenarioId
        ? carCategoriesApi.getAll(currentTenant.id, undefined, selectedScenarioId)
        : Promise.resolve([]),
    {
      enabled: !!currentTenant && !!selectedScenarioId,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车辆分类列表失败');
      },
    }
  );

  // 删除分类
  const deleteMutation = useMutation(
    (id: string) => carCategoriesApi.delete(currentTenant!.id, id),
    {
      onSuccess: () => {
        toast.success('车辆分类删除成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id, selectedScenarioId]);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除车辆分类失败');
      },
    }
  );

  const columns: Column<CarCategory>[] = [
    {
      key: 'image',
      title: '图片',
      width: '100px',
      render: (value: string) => (
        <img src={value} alt="分类图片" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
      ),
    },
    {
      key: 'name',
      title: '分类名称',
      width: '200px',
    },
    {
      key: 'vehicleScenario.name',
      title: '所属场景',
      width: '150px',
    },
    {
      key: 'badge',
      title: '标签',
      width: '120px',
    },
    {
      key: 'tags',
      title: '标签组',
      render: (value: string[]) => value?.join(', ') || '-',
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    navigate('/car-categories/new');
  };

  const handleEdit = (category: CarCategory) => {
    navigate(`/car-categories/${category.id}/edit`);
  };

  const handleDelete = (category: CarCategory) => {
    if (window.confirm(`确定要删除车辆分类 "${category.name}" 吗？`)) {
      deleteMutation.mutate(category.id);
    }
  };

  if (scenarios.length === 0) {
    return (
      <EmptyState
        title="还没有车辆场景"
        description="创建车辆分类前，需要先创建车辆场景。车辆分类必须归属于某个场景。"
        actionLabel="创建车辆场景"
        onAction={() => navigate('/vehicle-scenarios')}
        icon={<FontAwesomeIcon icon={faStream} />}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          选择车辆场景：
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
          {scenarios.length > 1 && <option value="">请选择场景</option>}
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        title="车辆分类管理"
        data={categories}
        columns={columns}
        loading={isLoading}
        onAdd={selectedScenarioId ? handleAdd : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="创建分类"
      />
    </div>
  );
}; 
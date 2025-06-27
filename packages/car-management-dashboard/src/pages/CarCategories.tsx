import { Column, DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, vehicleScenariosApi } from '@/lib/api';
import { CarCategory } from '@/types/api';
import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
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
        toast.error(error.response?.data?.message || '获取车型列表失败');
      },
      onSuccess: (data) => {
        setLocalCategories(data);
      },
    }
  );

  const [localCategories, setLocalCategories] = useState(categories);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const reorderMutation = useMutation(
    (data: { categoryIds: string[] }) => {
      if (!currentTenant || !selectedScenarioId) throw new Error('Missing tenant or scenario ID');
      return carCategoriesApi.reorder(currentTenant.id, selectedScenarioId, data.categoryIds);
    },
    {
      onSuccess: () => {
        toast.success('车型顺序更新成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id, selectedScenarioId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型顺序失败');
        // Revert local state on error
        setLocalCategories(categories);
      },
    }
  );

  // 删除分类
  const deleteMutation = useMutation(
    (id: string) => carCategoriesApi.delete(currentTenant!.id, id),
    {
      onSuccess: () => {
        toast.success('车型删除成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id, selectedScenarioId]);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除车型失败');
      },
    }
  );

  // 归档/取消归档分类
  const archiveMutation = useMutation(
    ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      if (!currentTenant) throw new Error("Missing tenant ID");
      return carCategoriesApi.update(currentTenant.id, id, { isArchived });
    },
    {
      onSuccess: (_, { isArchived }) => {
        toast.success(`车型 ${isArchived ? '下架' : '上架'} 成功`);
        queryClient.invalidateQueries(['car-categories', currentTenant?.id, selectedScenarioId]);
      },
      onError: (error: any, { isArchived }) => {
        toast.error(error.response?.data?.message || `车型 ${isArchived ? '下架' : '上架'} 失败`);
      },
    },
  );

  const columns: Column<CarCategory>[] = [
    {
      key: 'image',
      title: '图片',
      width: '100px',
      render: (value: string) => (
        <img src={value} alt="车型图片" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
      ),
    },
    {
      key: 'name',
      title: '车型名称',
      width: '200px',
    },
    {
      key: 'minPrice',
      title: '最低价格',
      width: '120px',
      render: (value?: number) =>
        value ? `¥${value.toLocaleString()}` : '-',
    },
    {
      key: 'maxPrice',
      title: '最高价格',
      width: '120px',
      render: (value?: number) =>
        value ? `¥${value.toLocaleString()}` : '-',
    },
    {
      key: 'vehicleScenario.name',
      title: '所属分类',
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
      key: 'isArchived',
      title: '状态',
      width: '100px',
      render: (isArchived: boolean) => (
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: isArchived ? '#fef2f2' : '#ecfdf5',
            color: isArchived ? '#ef4444' : '#10b981',
            whiteSpace: 'nowrap',
          }}
        >
          {isArchived ? '已下架' : '销售中'}
        </span>
      ),
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
    if (window.confirm(`确定要删除车型 "${category.name}" 吗？`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleArchiveToggle = (category: CarCategory) => {
    archiveMutation.mutate({ id: category.id, isArchived: !category.isArchived });
  };

  const handleReorder = (reorderedCategories: CarCategory[]) => {
    setLocalCategories(reorderedCategories);
    reorderMutation.mutate({ categoryIds: reorderedCategories.map((c) => c.id) });
  };

  if (scenarios.length === 0) {
    return (
      <EmptyState
        title="还没有车辆分类"
        description="创建车型前，需要先创建车辆分类。车型必须归属于某个分类。"
        actionLabel="创建车辆分类"
        onAction={() => navigate('/vehicle-scenarios')}
        icon={<FontAwesomeIcon icon={faStream} />}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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
        onAdd={selectedScenarioId ? handleAdd : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onArchiveToggle={handleArchiveToggle}
        onReorder={handleReorder}
        addButtonText="创建车型"
      />
    </div>
  );
}; 
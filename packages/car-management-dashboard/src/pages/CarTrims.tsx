import { Column, DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CarTrim } from '@/types/api';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export const CarTrims: React.FC = () => {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery(
    ['car-categories', currentTenant?.id],
    () => currentTenant ? carCategoriesApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      },
    }
  );

  const { data: trims = [], isLoading } = useQuery(
    ['car-trims', currentTenant?.id, selectedCategoryId],
    () =>
      currentTenant && selectedCategoryId
        ? carTrimsApi.getAll(currentTenant.id, selectedCategoryId)
        : Promise.resolve([]),
    {
      enabled: !!currentTenant && !!selectedCategoryId,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车型配置列表失败');
      },
      onSuccess: (data) => {
        setLocalTrims(data);
      },
    },
  );

  const [localTrims, setLocalTrims] = useState(trims);

  useEffect(() => {
    setLocalTrims(trims);
  }, [trims]);

  const reorderMutation = useMutation(
    (data: { trimIds: string[] }) => {
      if (!currentTenant || !selectedCategoryId) throw new Error('Missing tenant or category ID');
      return carTrimsApi.reorder(currentTenant.id, selectedCategoryId, data.trimIds);
    },
    {
      onSuccess: () => {
        toast.success('车型顺序更新成功');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型顺序失败');
        // Revert local state on error
        setLocalTrims(trims);
      },
    },
  );

  // 删除车型
  const deleteMutation = useMutation(
    (id: string) => carTrimsApi.delete(currentTenant!.id, id),
    {
      onSuccess: () => {
        toast.success('车型配置删除成功');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除车型配置失败');
      },
    }
  );

  const columns: Column<CarTrim>[] = [
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
      key: 'subtitle',
      title: '副标题',
      width: '200px',
    },
    {
      key: 'originalPrice',
      title: '原价',
      width: '120px',
    },
    {
      key: 'currentPrice',
      title: '现价',
      width: '120px',
      render: (value: string) => (
        <span style={{ color: '#f50', fontWeight: '600' }}>{value}</span>
      ),
    },
    {
      key: 'badge',
      title: '标签',
      width: '100px',
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    navigate('/car-trims/new');
  };

  const handleEdit = (trim: CarTrim) => {
    navigate(`/car-trims/${trim.id}/edit`);
  };

  const handleDelete = (trim: CarTrim) => {
    if (window.confirm(`确定要删除车型配置 "${trim.name}" 吗？`)) {
      deleteMutation.mutate(trim.id);
    }
  };

  const handleReorder = (reorderedTrims: CarTrim[]) => {
    setLocalTrims(reorderedTrims);
    reorderMutation.mutate({ trimIds: reorderedTrims.map((t) => t.id) });
  };

  // 如果没有分类，显示引导页面
  if (categories.length === 0) {
    return (
      <EmptyState
        title="还没有车辆分类"
        description="创建车型配置前，需要先创建车辆分类。车型配置必须归属于某个分类。"
        actionLabel="创建车辆分类"
        onAction={() => navigate('/car-categories')}
        icon={<FontAwesomeIcon icon={faCar} />}
      />
    );
  }

  return (
    <div>
      {/* 分类选择器 */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          选择车辆分类：
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
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
          {categories.length > 1 && <option value="">请选择分类</option>}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        title="车型配置管理"
        data={localTrims}
        columns={columns}
        loading={isLoading}
        onAdd={selectedCategoryId ? handleAdd : undefined}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReorder={handleReorder}
        addButtonText="创建车型"
      />
    </div>
  );
}; 
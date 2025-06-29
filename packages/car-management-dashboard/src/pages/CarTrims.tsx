import { Column, DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CarTrim } from '@/types/api';
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export const CarTrims: React.FC = () => {
  const { currentTenant, isViewer } = useAuth();
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'archived' | 'active'>('all');

  const { data: categories = [] } = useQuery(
    ['car-categories', currentTenant?.id],
    () => (currentTenant ? carCategoriesApi.getAll(currentTenant.id) : Promise.resolve([])),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      },
    },
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
        toast.error(error.response?.data?.message || '获取车型参数列表失败');
      },
    },
  );

  const filteredTrims = useMemo(() => {
    if (statusFilter === 'all') {
      return trims;
    }
    return trims.filter((trim) => (statusFilter === 'archived' ? trim.isArchived : !trim.isArchived));
  }, [trims, statusFilter]);

  const reorderMutation = useMutation(
    (data: { trimIds: string[] }) => {
      if (!currentTenant || !selectedCategoryId) throw new Error('Missing tenant or category ID');
      return carTrimsApi.reorder(currentTenant.id, selectedCategoryId, data.trimIds);
    },
    {
      onSuccess: () => {
        toast.success('车型参数顺序更新成功');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型参数顺序失败');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
      },
    },
  );

  const archiveMutation = useMutation(
    ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      if (!currentTenant) throw new Error('Missing tenant ID');
      return carTrimsApi.update(currentTenant.id, id, { isArchived });
    },
    {
      onSuccess: (_, { isArchived }) => {
        toast.success(`车型参数${isArchived ? '下架' : '上架'}成功`);
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
      },
      onError: (error: any, { isArchived }) => {
        toast.error(error.response?.data?.message || `车型参数${isArchived ? '下架' : '上架'}失败`);
      },
    },
  );

  const deleteMutation = useMutation((id: string) => carTrimsApi.delete(currentTenant!.id, id), {
    onSuccess: () => {
      toast.success('车型参数删除成功');
      queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
      queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除车型参数失败');
    },
  });

  const columns: Column<CarTrim>[] = [
    {
      key: 'image',
      title: '图片',
      width: '100px',
      render: (value: string) => (
        <img
          src={value}
          alt="车型参数图片"
          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      key: 'configImageUrl',
      title: '配置图片',
      width: '100px',
      render: (value: string) =>
        value ? (
          <img
            src={value}
            alt="配置参数图片"
            style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
          />
        ) : (
          '未上传'
        ),
    },
    {
      key: 'name',
      title: '名称',
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
      render: (value: string) => <span style={{ color: '#f50', fontWeight: '600' }}>{value}</span>,
    },
    {
      key: 'badge',
      title: '标签',
      width: '100px',
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
    navigate('/car-trims/new');
  };

  const handleEdit = (trim: CarTrim) => {
    navigate(`/car-trims/${trim.id}/edit`);
  };

  const handleArchiveToggle = (trim: CarTrim) => {
    archiveMutation.mutate({ id: trim.id, isArchived: !trim.isArchived });
  };

  const handleDelete = (trim: CarTrim) => {
    if (window.confirm(`确定要删除车型参数 "${trim.name}" 吗？`)) {
      deleteMutation.mutate(trim.id);
    }
  };

  const handleReorder = (reorderedTrims: CarTrim[]) => {
    reorderMutation.mutate({ trimIds: reorderedTrims.map((t) => t.id) });
  };

  const getActions = (trim: CarTrim) => {
    const actions = [
      {
        label: '编辑',
        onClick: handleEdit,
      },
      {
        label: trim.isArchived ? '上架' : '下架',
        onClick: handleArchiveToggle,
      },
      {
        label: '删除',
        onClick: handleDelete,
        isDanger: true,
      },
    ];

    if (isViewer) {
      return [];
    }

    return actions;
  };

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
              onChange={(e) => setStatusFilter(e.target.value as any)}
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
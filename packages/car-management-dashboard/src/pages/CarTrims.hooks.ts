import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CarTrim } from '@/types/api';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useCarTrims = () => {
  const { currentTenant, isViewer } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId') || '';
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'archived' | 'active'>('all');

  const setSelectedCategoryId = (categoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('categoryId', categoryId);
    setSearchParams(newSearchParams);
  };

  const { data: categories = [] } = useQuery(
    ['car-categories', currentTenant?.id],
    () =>
      currentTenant
        ? carCategoriesApi.getAll(currentTenant.id, undefined)
        : Promise.resolve([]),
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

  const handleAdd = () => {
    navigate(`/car-trims/new?categoryId=${selectedCategoryId}`);
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
        onClick: () => handleEdit(trim),
      },
      {
        label: trim.isArchived ? '上架' : '下架',
        onClick: () => handleArchiveToggle(trim),
      },
      {
        label: '删除',
        onClick: () => handleDelete(trim),
        isDanger: true,
      },
    ];

    if (isViewer) {
      return [];
    }

    return actions;
  };

  return {
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
    currentTenant,
  };
};
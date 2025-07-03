import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, vehicleScenariosApi } from '@/lib/api';
import { CarCategory } from '@/types/api';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';

export const useCarCategories = () => {
  const { currentTenant, isViewer } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedScenarioId = searchParams.get('vehicleScenarioId') || '';

  const setSelectedScenarioId = (id: string) => {
    setSearchParams({ vehicleScenarioId: id });
  };

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
    },
  );

  const { data: fetchedCategories, isLoading } = useQuery(
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
    },
  );

  const categories = useMemo(() => fetchedCategories || [], [fetchedCategories]);

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
        setLocalCategories(categories);
      },
    },
  );

  const deleteMutation = useMutation((id: string) => carCategoriesApi.delete(currentTenant!.id, id), {
    onSuccess: () => {
      toast.success('车型删除成功');
      queryClient.invalidateQueries(['car-categories', currentTenant?.id, selectedScenarioId]);
      queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除车型失败');
    },
  });

  const archiveMutation = useMutation(
    ({ id, isArchived }: { id: string; isArchived: boolean }) => {
      if (!currentTenant) throw new Error('Missing tenant ID');
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

  const handleReorder = (reorderedCategories: CarCategory[]) => {
    setLocalCategories(reorderedCategories);
    reorderMutation.mutate({ categoryIds: reorderedCategories.map((c) => c.id) });
  };

  const handleDelete = (category: CarCategory) => {
    if (window.confirm(`确定要删除车型 "${category.name}" 吗？`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleArchiveToggle = (category: CarCategory) => {
    archiveMutation.mutate({ id: category.id, isArchived: !category.isArchived });
  };

  return {
    isViewer,
    scenarios,
    selectedScenarioId,
    setSelectedScenarioId,
    isLoading,
    localCategories,
    handleReorder,
    handleDelete,
    handleArchiveToggle,
  };
}; 
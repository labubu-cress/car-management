import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, vehicleScenariosApi } from '@/lib/api';
import { CreateCarCategoryInput, Highlight, UpdateCarCategoryInput } from '@/types/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export const useCarCategoryForm = (id?: string, vehicleScenarioIdFromQuery?: string | null) => {
  const navigate = useNavigate();
  const { currentTenant, isViewer } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    badge: '',
    tags: [] as string[],
    highlights: [] as Highlight[],
    interiorImages: [] as string[],
    exteriorImages: [] as string[],
    offerPictures: [] as string[],
    vehicleScenarioId: '',
    minPrice: 0,
    maxPrice: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isViewer && !isEdit) {
      toast.error('您没有权限创建新的车型。');
      navigate('/car-categories');
    }
  }, [isViewer, isEdit, navigate]);

  const { data: scenarios = [] } = useQuery(
    ['vehicle-scenarios', currentTenant?.id],
    () => (currentTenant ? vehicleScenariosApi.getAll(currentTenant.id) : Promise.resolve([])),
    {
      enabled: !!currentTenant,
    }
  );

  useEffect(() => {
    if (isEdit) return;

    if (vehicleScenarioIdFromQuery) {
      setFormData((prev) => ({ ...prev, vehicleScenarioId: vehicleScenarioIdFromQuery }));
    } else if (scenarios.length > 0) {
      setFormData((prev) => ({ ...prev, vehicleScenarioId: scenarios[0].id }));
    }
  }, [isEdit, vehicleScenarioIdFromQuery, scenarios]);

  const { isLoading } = useQuery(
    ['car-category', currentTenant?.id, id],
    () => (currentTenant && id ? carCategoriesApi.getById(currentTenant.id, id) : null),
    {
      enabled: !!currentTenant && !!id,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name,
            image: data.image,
            badge: data.badge || '',
            tags: data.tags || [],
            highlights: data.highlights || [],
            interiorImages: data.interiorImages || [],
            exteriorImages: data.exteriorImages || [],
            offerPictures: data.offerPictures || [],
            vehicleScenarioId: data.vehicleScenario?.id || '',
            minPrice: data.minPrice || 0,
            maxPrice: data.maxPrice || 0,
          });
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车型详情失败');
        navigate('/car-categories');
      },
    }
  );

  const createMutation = useMutation(
    (data: CreateCarCategoryInput) => carCategoriesApi.create(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('车型创建成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id]);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
        navigate('/car-categories');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建车型失败');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateCarCategoryInput }) =>
      carCategoriesApi.update(currentTenant!.id, id, data),
    {
      onSuccess: () => {
        toast.success('车型更新成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id]);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
        navigate('/car-categories');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型失败');
      },
    }
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入车型名称';
    }

    if (!formData.image.trim()) {
      newErrors.image = '请上传车型图片';
    }

    if (!formData.vehicleScenarioId) {
      newErrors.vehicleScenarioId = '请选择所属分类';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isViewer) {
      toast.error('您没有权限执行此操作');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const commonData = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      badge: formData.badge.trim() || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      highlights: formData.highlights.length > 0 ? formData.highlights : undefined,
      interiorImages: formData.interiorImages.length > 0 ? formData.interiorImages : undefined,
      exteriorImages: formData.exteriorImages.length > 0 ? formData.exteriorImages : undefined,
      offerPictures: formData.offerPictures.length > 0 ? formData.offerPictures : undefined,
      vehicleScenarioId: formData.vehicleScenarioId,
      minPrice: Number(formData.minPrice) || undefined,
      maxPrice: Number(formData.maxPrice) || undefined,
    };

    if (isEdit && id) {
      updateMutation.mutate({ id, data: commonData });
    } else {
      createMutation.mutate(commonData);
    }
  };

  const handleBack = () => {
    navigate('/car-categories');
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return {
    isEdit,
    formData,
    setFormData,
    errors,
    scenarios,
    isLoading,
    isSubmitting,
    handleSubmit,
    handleBack,
    currentTenant,
    isViewer,
  };
}; 
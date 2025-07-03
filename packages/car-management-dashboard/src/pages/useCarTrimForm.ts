import { Highlight } from '@/components/HighlightInput';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CreateCarTrimInput, UpdateCarTrimInput } from '@/types/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';

export const useCarTrimForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant, isViewer } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    configImageUrl: '',
    originalPrice: '',
    currentPrice: '',
    priceOverrideText: '',
    badge: '',
    features: [] as Highlight[],
    categoryId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isViewer && !isEdit) {
      toast.error('您没有权限创建新的车型参数。');
      navigate('/car-trims');
    }
  }, [isViewer, isEdit, navigate]);

  const { data: categories = [] } = useQuery(
    ['car-categories', currentTenant?.id],
    () => (currentTenant ? carCategoriesApi.getAll(currentTenant.id) : Promise.resolve([])),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !formData.categoryId && !isEdit) {
          setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
        }
      },
    }
  );

  const { isLoading: isFetchingDetails } = useQuery(
    ['car-trim', currentTenant?.id, id],
    () => (currentTenant && id ? carTrimsApi.getById(currentTenant.id, id) : null),
    {
      enabled: !!currentTenant && !!id,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name,
            subtitle: data.subtitle,
            configImageUrl: data.configImageUrl || '',
            originalPrice: data.originalPrice,
            currentPrice: data.currentPrice,
            priceOverrideText: data.priceOverrideText || '',
            badge: data.badge || '',
            features: data.features || [],
            categoryId: data.categoryId,
          });
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车型参数详情失败');
        navigate('/car-trims');
      },
    }
  );

  const createMutation = useMutation(
    (data: CreateCarTrimInput) => carTrimsApi.create(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('车型参数创建成功');
        queryClient.invalidateQueries(['car-trims']);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
        navigate('/car-trims');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建车型参数失败');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateCarTrimInput }) =>
      carTrimsApi.update(currentTenant!.id, id, data),
    {
      onSuccess: () => {
        toast.success('车型参数更新成功');
        queryClient.invalidateQueries(['car-trims']);
        queryClient.invalidateQueries(['dashboard-stats', currentTenant?.id]);
        navigate('/car-trims');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型参数失败');
      },
    }
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入车型参数名称';
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = '请输入副标题';
    }

    if (!formData.originalPrice.trim()) {
      newErrors.originalPrice = '请输入原价';
    }

    if (!formData.currentPrice.trim() && !formData.priceOverrideText.trim()) {
      newErrors.currentPrice = '请输入现价或相关说明文字';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = '请选择车型';
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

    const { features, ...restFormData } = formData;

    const baseData = {
      ...restFormData,
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      configImageUrl: formData.configImageUrl?.trim() || undefined,
      originalPrice: formData.originalPrice.trim(),
      badge: formData.badge.trim() || undefined,
      features: formData.features.length > 0 ? formData.features : undefined,
      categoryId: formData.categoryId,
    };

    const data = {
      ...baseData,
      currentPrice: baseData.priceOverrideText ? baseData.originalPrice : baseData.currentPrice,
      priceOverrideText: baseData.priceOverrideText ? baseData.priceOverrideText : undefined,
    };

    if (isEdit && id) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBack = () => {
    navigate('/car-trims');
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return {
    id,
    isEdit,
    formData,
    setFormData,
    errors,
    categories,
    isFetchingDetails,
    isSubmitting,
    handleSubmit,
    handleBack,
    currentTenant,
    isViewer,
  };
}; 
import { FormField } from '@/components/FormField';
import { formFieldStyles } from '@/components/FormField.css';
import { Highlight, HighlightInput } from '@/components/HighlightInput';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CreateCarTrimInput, UpdateCarTrimInput } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { carTrimFormStyles } from './CarTrimForm.css';

export const CarTrimForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    image: '',
    originalPrice: '',
    currentPrice: '',
    badge: '',
    features: [] as Highlight[],
    categoryId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 获取分类列表
  const { data: categories = [] } = useQuery(
    ['car-categories', currentTenant?.id],
    () => currentTenant ? carCategoriesApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !formData.categoryId && !isEdit) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      },
    }
  );

  // 获取车型详情（编辑模式）
  const { data: trim, isLoading } = useQuery(
    ['car-trim', currentTenant?.id, id],
    () => currentTenant && id ? carTrimsApi.getById(currentTenant.id, id) : null,
    {
      enabled: !!currentTenant && !!id,
      onSuccess: (data) => {
        if (data) {
          setFormData({
            name: data.name,
            subtitle: data.subtitle,
            image: data.image,
            originalPrice: data.originalPrice,
            currentPrice: data.currentPrice,
            badge: data.badge || '',
            features: data.features || [],
            categoryId: data.categoryId,
          });
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车型详情失败');
        navigate('/car-trims');
      },
    }
  );

  // 创建车型
  const createMutation = useMutation(
    (data: CreateCarTrimInput) => carTrimsApi.create(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('车型配置创建成功');
        queryClient.invalidateQueries(['car-trims']);
        navigate('/car-trims');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建车型配置失败');
      },
    }
  );

  // 更新车型
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateCarTrimInput }) =>
      carTrimsApi.update(currentTenant!.id, id, data),
    {
      onSuccess: () => {
        toast.success('车型配置更新成功');
        queryClient.invalidateQueries(['car-trims']);
        navigate('/car-trims');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型配置失败');
      },
    }
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入车型名称';
    }
    
    if (!formData.subtitle.trim()) {
      newErrors.subtitle = '请输入副标题';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = '请输入车型图片地址';
    }
    
    if (!formData.originalPrice.trim()) {
      newErrors.originalPrice = '请输入原价';
    }
    
    if (!formData.currentPrice.trim()) {
      newErrors.currentPrice = '请输入现价';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = '请选择车辆分类';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEdit && id) {
      const updateData: UpdateCarTrimInput = {
        name: formData.name.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image.trim(),
        originalPrice: formData.originalPrice.trim(),
        currentPrice: formData.currentPrice.trim(),
        badge: formData.badge.trim() || undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        categoryId: formData.categoryId,
      };
      updateMutation.mutate({ id, data: updateData });
    } else {
      const createData: CreateCarTrimInput = {
        name: formData.name.trim(),
        subtitle: formData.subtitle.trim(),
        image: formData.image.trim(),
        originalPrice: formData.originalPrice.trim(),
        currentPrice: formData.currentPrice.trim(),
        badge: formData.badge.trim() || undefined,
        features: formData.features.length > 0 ? formData.features : undefined,
        categoryId: formData.categoryId,
      };
      createMutation.mutate(createData);
    }
  };

  const handleBack = () => {
    navigate('/car-trims');
  };

  // 如果没有分类，显示引导
  if (categories.length === 0) {
    return (
      <div className={carTrimFormStyles.container}>
        <div className={carTrimFormStyles.emptyState}>
          <h2>还没有车辆分类</h2>
          <p>创建车型配置前，请先创建车辆分类</p>
          <button 
            onClick={() => navigate('/car-categories')}
            className={carTrimFormStyles.createCategoryButton}
          >
            去创建分类
          </button>
        </div>
      </div>
    );
  }

  if (isEdit && isLoading) {
    return <div className={carTrimFormStyles.loading}>加载中...</div>;
  }

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className={carTrimFormStyles.container}>
      <div className={carTrimFormStyles.header}>
        <h1 className={carTrimFormStyles.title}>
          {isEdit ? '编辑车型配置' : '创建车型配置'}
        </h1>
        <button onClick={handleBack} className={carTrimFormStyles.backButton}>
          返回列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className={carTrimFormStyles.form}>
        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>基本信息</h2>
          
          <FormField label="车型名称" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入车型名称"
            />
          </FormField>

          <FormField label="副标题" required error={errors.subtitle}>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入副标题"
            />
          </FormField>

          <FormField label="车型图片" required error={errors.image}>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入图片URL地址"
            />
          </FormField>

          <FormField label="所属分类" required error={errors.categoryId}>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={formFieldStyles.select}
              disabled={categories.length <= 1}
            >
              {categories.length > 1 && <option value="">请选择分类</option>}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>价格信息</h2>
          
          <FormField label="原价" required error={errors.originalPrice}>
            <input
              type="text"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              className={formFieldStyles.input}
              placeholder="如：¥299,800"
            />
          </FormField>

          <FormField label="现价" required error={errors.currentPrice}>
            <input
              type="text"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              className={formFieldStyles.input}
              placeholder="如：¥259,800"
            />
          </FormField>

          <FormField label="标签徽章">
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className={formFieldStyles.input}
              placeholder="如：热销、限时优惠等"
            />
          </FormField>
        </div>

        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>车型特色</h2>
          <FormField label="特色功能">
            <HighlightInput
              value={formData.features}
              onChange={(features) => setFormData({ ...formData, features })}
              placeholder={{ title: '功能名称', value: '功能描述' }}
            />
          </FormField>
        </div>

        <div className={carTrimFormStyles.actions}>
          <button
            type="button"
            onClick={handleBack}
            className={carTrimFormStyles.cancelButton}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className={carTrimFormStyles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : (isEdit ? '更新配置' : '创建配置')}
          </button>
        </div>
      </form>
    </div>
  );
}; 
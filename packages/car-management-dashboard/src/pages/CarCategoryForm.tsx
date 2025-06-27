import { FormField } from '@/components/FormField';
import { formFieldStyles } from '@/components/FormField.css';
import { Highlight, HighlightInput } from '@/components/HighlightInput';
import { ImageUpload } from '@/components/ImageUpload';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { TagInput } from '@/components/TagInput';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, vehicleScenariosApi } from '@/lib/api';
import { CreateCarCategoryInput, UpdateCarCategoryInput } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { carCategoryFormStyles } from './CarCategoryForm.css';

export const CarCategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTenant } = useAuth();
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

  // 获取场景列表
  const { data: scenarios = [] } = useQuery(
    ['vehicle-scenarios', currentTenant?.id],
    () => currentTenant ? vehicleScenariosApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onSuccess: (data) => {
        if (data.length > 0 && !formData.vehicleScenarioId && !isEdit) {
          setFormData(prev => ({ ...prev, vehicleScenarioId: data[0].id }));
        }
      },
    }
  );

  // 获取分类详情（编辑模式）
  const { isLoading } = useQuery(
    ['car-category', currentTenant?.id, id],
    () => currentTenant && id ? carCategoriesApi.getById(currentTenant.id, id) : null,
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

  // 创建分类
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

  // 更新分类
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
    
    if (!validateForm()) {
      return;
    }

    if (isEdit && id) {
      const updateData: UpdateCarCategoryInput = {
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
      updateMutation.mutate({ id, data: updateData });
    } else {
      const createData: CreateCarCategoryInput = {
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
      createMutation.mutate(createData);
    }
  };

  const handleBack = () => {
    navigate('/car-categories');
  };

  if (!currentTenant) {
    return <div>加载租户信息...</div>;
  }

  // 如果没有场景，显示引导
  if (scenarios.length === 0) {
    return (
      <div className={carCategoryFormStyles.container}>
        <div className={carCategoryFormStyles.emptyState}>
          <h2>还没有车辆分类</h2>
          <p>创建车型前，请先创建车辆分类</p>
          <button
            onClick={() => navigate('/vehicle-scenarios')}
            className={carCategoryFormStyles.createButton}
          >
            去创建车辆分类
          </button>
        </div>
      </div>
    );
  }

  if (isEdit && isLoading) {
    return <div className={carCategoryFormStyles.loading}>加载中...</div>;
  }

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className={carCategoryFormStyles.container}>
      <div className={carCategoryFormStyles.header}>
        <h1 className={carCategoryFormStyles.title}>
          {isEdit ? '编辑车型' : '创建车型'}
        </h1>
        <button onClick={handleBack} className={carCategoryFormStyles.backButton}>
          返回车型列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className={carCategoryFormStyles.form}>
        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>基本信息</h2>
          
          <FormField label="所属分类" required error={errors.vehicleScenarioId}>
            <select
              value={formData.vehicleScenarioId}
              onChange={(e) => setFormData({ ...formData, vehicleScenarioId: e.target.value })}
              className={formFieldStyles.select}
            >
              <option value="" disabled>请选择车辆分类</option>
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </FormField>
          
          <FormField label="车型名称" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入车型名称"
            />
          </FormField>

          <FormField label="最低价格">
            <input
              type="number"
              value={formData.minPrice}
              onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
              className={formFieldStyles.input}
              placeholder="请输入最低价格"
            />
          </FormField>

          <FormField label="最高价格">
            <input
              type="number"
              value={formData.maxPrice}
              onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
              className={formFieldStyles.input}
              placeholder="请输入最高价格"
            />
          </FormField>

          <FormField label="车型图片" required error={errors.image}>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              tenantId={currentTenant.id}
            />
          </FormField>

          <FormField label="标签徽章">
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入标签徽章"
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>标签组</h2>
          <FormField label="标签列表">
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder="输入标签后按回车添加"
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>特色亮点</h2>
          <FormField label="亮点列表">
            <HighlightInput
              value={formData.highlights}
              onChange={(highlights) => setFormData({ ...formData, highlights })}
              placeholder={{ title: '如：百公里加速', icon: '特色图标' }}
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>图片资源</h2>
          
          <FormField label="内饰图片">
            <MultiImageUpload
              values={formData.interiorImages}
              onChange={(urls) => setFormData({ ...formData, interiorImages: urls })}
              tenantId={currentTenant.id}
            />
          </FormField>

          <FormField label="外观图片">
            <MultiImageUpload
              values={formData.exteriorImages}
              onChange={(urls) => setFormData({ ...formData, exteriorImages: urls })}
              tenantId={currentTenant.id}
            />
          </FormField>

          <FormField label="优惠图片">
            <MultiImageUpload
              values={formData.offerPictures}
              onChange={(urls) => setFormData({ ...formData, offerPictures: urls })}
              tenantId={currentTenant.id}
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.actions}>
          <button
            type="button"
            onClick={handleBack}
            className={carCategoryFormStyles.cancelButton}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className={carCategoryFormStyles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : (isEdit ? '更新分类' : '创建分类')}
          </button>
        </div>
      </form>
    </div>
  );
}; 
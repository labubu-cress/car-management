import { Column, DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CarTrim, CreateCarTrimInput, UpdateCarTrimInput } from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

interface CarTrimFormData {
  name: string;
  subtitle: string;
  image: string;
  originalPrice: string;
  currentPrice: string;
  badge: string;
  features: string;
  categoryId: string;
}

export const CarTrims: React.FC = () => {
  const { currentTenant } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrim, setEditingTrim] = useState<CarTrim | null>(null);
  const [formData, setFormData] = useState<CarTrimFormData>({
    name: '',
    subtitle: '',
    image: '',
    originalPrice: '',
    currentPrice: '',
    badge: '',
    features: '',
    categoryId: '',
  });

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
    () => currentTenant && selectedCategoryId 
      ? carTrimsApi.getAll(currentTenant.id, selectedCategoryId) 
      : Promise.resolve([]),
    {
      enabled: !!currentTenant && !!selectedCategoryId,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车型配置列表失败');
      },
    }
  );

  // 创建车型
  const createMutation = useMutation(
    (data: CreateCarTrimInput) => carTrimsApi.create(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('车型配置创建成功');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
        handleCloseModal();
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
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车型配置失败');
      },
    }
  );

  // 删除车型
  const deleteMutation = useMutation(
    (id: string) => carTrimsApi.delete(currentTenant!.id, id),
    {
      onSuccess: () => {
        toast.success('车型配置删除成功');
        queryClient.invalidateQueries(['car-trims', currentTenant?.id, selectedCategoryId]);
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
    if (!selectedCategoryId) {
      toast.error('请先选择车辆分类');
      return;
    }
    setEditingTrim(null);
    setFormData({
      name: '',
      subtitle: '',
      image: '',
      originalPrice: '',
      currentPrice: '',
      badge: '',
      features: '',
      categoryId: selectedCategoryId,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (trim: CarTrim) => {
    setEditingTrim(trim);
    setFormData({
      name: trim.name,
      subtitle: trim.subtitle,
      image: trim.image,
      originalPrice: trim.originalPrice,
      currentPrice: trim.currentPrice,
      badge: trim.badge || '',
      features: trim.features?.map(f => `${f.title}:${f.value}`).join(', ') || '',
      categoryId: trim.categoryId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (trim: CarTrim) => {
    if (window.confirm(`确定要删除车型配置 "${trim.name}" 吗？`)) {
      deleteMutation.mutate(trim.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTrim(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入车型名称');
      return;
    }

    if (!formData.subtitle.trim()) {
      toast.error('请输入副标题');
      return;
    }

    if (!formData.image.trim()) {
      toast.error('请输入车型图片地址');
      return;
    }

    if (!formData.originalPrice.trim()) {
      toast.error('请输入原价');
      return;
    }

    if (!formData.currentPrice.trim()) {
      toast.error('请输入现价');
      return;
    }

    if (!formData.categoryId) {
      toast.error('请选择车辆分类');
      return;
    }

    const submitData: CreateCarTrimInput | UpdateCarTrimInput = {
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim(),
      image: formData.image.trim(),
      originalPrice: formData.originalPrice.trim(),
      currentPrice: formData.currentPrice.trim(),
      badge: formData.badge.trim() || undefined,
      features: formData.features.trim() ? formData.features.split(',').map(item => {
        const [title, value] = item.split(':').map(s => s.trim());
        return { title: title || '', value: value || '' };
      }).filter(f => f.title && f.value) : undefined,
      categoryId: formData.categoryId,
    };

    if (editingTrim) {
      updateMutation.mutate({
        id: editingTrim.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData as CreateCarTrimInput);
    }
  };

  const handleInputChange = (field: keyof CarTrimFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  if (!currentTenant) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>请选择租户</h2>
        <p>请先选择一个租户来管理车型配置</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', marginRight: '12px' }}>
          选择车辆分类:
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="">请选择分类</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        title="车型配置管理"
        columns={columns}
        data={trims}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="添加车型"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTrim ? '编辑车型配置' : '添加车型配置'}
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                padding: '8px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
              取消
            </button>
            <button
              type="submit"
              form="car-trim-form"
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: '#1890ff',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <FontAwesomeIcon icon={faCheck} style={{ marginRight: '8px' }} />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        }
      >
        <form id="car-trim-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>车型名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入车型名称"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>副标题 *</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入副标题"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>车型图片 *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入图片地址"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>原价 *</label>
            <input
              type="text"
              value={formData.originalPrice}
              onChange={(e) => handleInputChange('originalPrice', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入原价"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>现价 *</label>
            <input
              type="text"
              value={formData.currentPrice}
              onChange={(e) => handleInputChange('currentPrice', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入现价"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>标签</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => handleInputChange('badge', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="请输入标签"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>车辆分类 *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              disabled={isSubmitting}
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>特色功能</label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => handleInputChange('features', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="格式: 功能:描述, 功能:描述"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}; 
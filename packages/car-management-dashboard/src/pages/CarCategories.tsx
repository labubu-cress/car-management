import { Column, DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi } from '@/lib/api';
import { CarCategory, CreateCarCategoryInput, UpdateCarCategoryInput } from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

interface CarCategoryFormData {
  name: string;
  image: string;
  badge: string;
  tags: string;
  highlights: string;
  interiorImages: string;
  exteriorImages: string;
  offerPictures: string;
}

export const CarCategories: React.FC = () => {
  const { currentTenant } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CarCategory | null>(null);
  const [formData, setFormData] = useState<CarCategoryFormData>({
    name: '',
    image: '',
    badge: '',
    tags: '',
    highlights: '',
    interiorImages: '',
    exteriorImages: '',
    offerPictures: '',
  });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery(
    ['car-categories', currentTenant?.id],
    () => currentTenant ? carCategoriesApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车辆分类列表失败');
      },
    }
  );

  // 创建分类
  const createMutation = useMutation(
    (data: CreateCarCategoryInput) => carCategoriesApi.create(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('车辆分类创建成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建车辆分类失败');
      },
    }
  );

  // 更新分类
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateCarCategoryInput }) =>
      carCategoriesApi.update(currentTenant!.id, id, data),
    {
      onSuccess: () => {
        toast.success('车辆分类更新成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车辆分类失败');
      },
    }
  );

  // 删除分类
  const deleteMutation = useMutation(
    (id: string) => carCategoriesApi.delete(currentTenant!.id, id),
    {
      onSuccess: () => {
        toast.success('车辆分类删除成功');
        queryClient.invalidateQueries(['car-categories', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除车辆分类失败');
      },
    }
  );

  const columns: Column<CarCategory>[] = [
    {
      key: 'image',
      title: '图片',
      width: '100px',
      render: (value: string) => (
        <img src={value} alt="分类图片" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
      ),
    },
    {
      key: 'name',
      title: '分类名称',
      width: '200px',
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
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      image: '',
      badge: '',
      tags: '',
      highlights: '',
      interiorImages: '',
      exteriorImages: '',
      offerPictures: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: CarCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: category.image,
      badge: category.badge || '',
      tags: category.tags?.join(', ') || '',
      highlights: category.highlights?.map(h => `${h.title}:${h.value}`).join(', ') || '',
      interiorImages: category.interiorImages?.join(', ') || '',
      exteriorImages: category.exteriorImages?.join(', ') || '',
      offerPictures: category.offerPictures?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (category: CarCategory) => {
    if (window.confirm(`确定要删除车辆分类 "${category.name}" 吗？`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    if (!formData.image.trim()) {
      toast.error('请输入分类图片地址');
      return;
    }

    const submitData: CreateCarCategoryInput | UpdateCarCategoryInput = {
      name: formData.name.trim(),
      image: formData.image.trim(),
      badge: formData.badge.trim() || undefined,
      tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      highlights: formData.highlights.trim() ? formData.highlights.split(',').map(item => {
        const [title, value] = item.split(':').map(s => s.trim());
        return { title: title || '', value: value || '' };
      }).filter(h => h.title && h.value) : undefined,
      interiorImages: formData.interiorImages.trim() ? formData.interiorImages.split(',').map(img => img.trim()).filter(Boolean) : undefined,
      exteriorImages: formData.exteriorImages.trim() ? formData.exteriorImages.split(',').map(img => img.trim()).filter(Boolean) : undefined,
      offerPictures: formData.offerPictures.trim() ? formData.offerPictures.split(',').map(img => img.trim()).filter(Boolean) : undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData as CreateCarCategoryInput);
    }
  };

  const handleInputChange = (field: keyof CarCategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  if (!currentTenant) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>请选择租户</h2>
        <p>请先选择一个租户来管理车辆分类</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <DataTable
        title="车辆分类管理"
        columns={columns}
        data={categories}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="添加分类"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? '编辑车辆分类' : '添加车辆分类'}
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
              form="car-category-form"
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
        <form id="car-category-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>分类名称 *</label>
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
              placeholder="请输入分类名称"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>分类图片 *</label>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>标签组</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="多个标签用逗号分隔"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>特色亮点</label>
            <input
              type="text"
              value={formData.highlights}
              onChange={(e) => handleInputChange('highlights', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="格式: 标题:值, 标题:值"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>内饰图片</label>
            <input
              type="text"
              value={formData.interiorImages}
              onChange={(e) => handleInputChange('interiorImages', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="多个图片地址用逗号分隔"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>外观图片</label>
            <input
              type="text"
              value={formData.exteriorImages}
              onChange={(e) => handleInputChange('exteriorImages', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="多个图片地址用逗号分隔"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>优惠图片</label>
            <input
              type="text"
              value={formData.offerPictures}
              onChange={(e) => handleInputChange('offerPictures', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              placeholder="多个图片地址用逗号分隔"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}; 
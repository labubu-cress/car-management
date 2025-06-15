import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi } from '@/lib/api';
import { CarCategory } from '@/types/api';
import React from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export const CarCategories: React.FC = () => {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
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
    navigate('/car-categories/new');
  };

  const handleEdit = (category: CarCategory) => {
    navigate(`/car-categories/${category.id}/edit`);
  };

  const handleDelete = (category: CarCategory) => {
    if (window.confirm(`确定要删除车辆分类 "${category.name}" 吗？`)) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <div>
      <DataTable
        title="车辆分类管理"
        data={categories}
        columns={columns}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="创建分类"
      />
    </div>
  );
}; 
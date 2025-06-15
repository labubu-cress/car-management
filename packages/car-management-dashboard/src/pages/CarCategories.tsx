import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi } from '@/lib/api';
import { CarCategory } from '@/types/api';
import React from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

export const CarCategories: React.FC = () => {
  const { currentTenant } = useAuth();

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
        addButtonText="添加分类"
      />
    </div>
  );
}; 
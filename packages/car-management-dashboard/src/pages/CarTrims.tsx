import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { carCategoriesApi, carTrimsApi } from '@/lib/api';
import { CarTrim } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

export const CarTrims: React.FC = () => {
  const { currentTenant } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

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
        addButtonText="添加车型"
      />
    </div>
  );
}; 
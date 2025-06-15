import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { User } from '@/types/api';
import React from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

export const Users: React.FC = () => {
  const { currentTenant } = useAuth();

  const { data: users = [], isLoading } = useQuery(
    ['users', currentTenant?.id],
    () => currentTenant ? usersApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取用户列表失败');
      },
    }
  );

  const columns: Column<User>[] = [
    {
      key: 'avatarUrl',
      title: '头像',
      width: '80px',
      render: (value: string) => (
        <img 
          src={value} 
          alt="用户头像" 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            objectFit: 'cover' 
          }} 
        />
      ),
    },
    {
      key: 'nickname',
      title: '昵称',
      width: '150px',
    },
    {
      key: 'phoneNumber',
      title: '手机号',
      width: '150px',
    },
    {
      key: 'openId',
      title: 'OpenID',
      width: '200px',
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {value.substring(0, 20)}...
        </span>
      ),
    },
    {
      key: 'unionId',
      title: 'UnionID',
      width: '200px',
      render: (value: string | null) => value ? (
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
          {value.substring(0, 20)}...
        </span>
      ) : '-',
    },
    {
      key: 'createdAt',
      title: '注册时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  if (!currentTenant) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>请选择租户</h2>
        <p>请先选择一个租户来查看用户信息</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <DataTable
        title="用户管理"
        columns={columns}
        data={users}
        loading={isLoading}
      />
    </div>
  );
}; 
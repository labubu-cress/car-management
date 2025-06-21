import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { userMessagesApi } from '@/lib/api';
import { UserMessage } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';
import * as styles from './UserMessages.css';

export const UserMessages: React.FC = () => {
  const { currentTenant } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading } = useQuery(
    ['userMessages', currentTenant?.id, page, pageSize],
    () => (currentTenant ? userMessagesApi.getAll(currentTenant.id, page, pageSize) : Promise.resolve({ messages: [], total: 0 })),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取留言列表失败');
      },
    }
  );

  const columns: Column<UserMessage>[] = [
    {
      key: 'user.avatarUrl',
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
            objectFit: 'cover',
          }}
        />
      ),
    },
    {
      key: 'user.nickname',
      title: '昵称',
    },
    {
      key: 'name',
      title: '姓名',
    },
    {
      key: 'contact',
      title: '联系方式',
    },
    {
      key: 'content',
      title: '留言内容',
      width: '300px',
    },
    {
      key: 'createdAt',
      title: '留言时间',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
    {
        key: 'user.phoneNumber',
        title: '用户手机',
    },
    {
        key: 'user.createdAt',
        title: '注册时间',
        render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  if (!currentTenant) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>请选择租户</h2>
        <p>请先选择一个租户来查看用户留言</p>
      </div>
    );
  }

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div style={{ padding: '24px' }}>
      <DataTable title="用户留言" columns={columns} data={data?.messages || []} loading={isLoading} />
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            下一页
          </button>
        </div>
      )}
    </div>
  );
}; 
import { Column, DataTable } from '@/components/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { userMessagesApi } from '@/lib/api';
import { buttonPrimary, buttonSecondary } from '@/styles/theme.css';
import { UserMessage } from '@/types/api';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as styles from './UserMessages.css';

type Status = 'PENDING' | 'PROCESSED';

export const UserMessages: React.FC = () => {
  const { currentTenant, isViewer } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState<Status>('PENDING');

  const { data, isLoading } = useQuery(
    ['userMessages', currentTenant?.id, page, pageSize, status],
    () =>
      currentTenant
        ? userMessagesApi.getAll(currentTenant.id, page, pageSize, status)
        : Promise.resolve({ messages: [], total: 0 }),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取留言列表失败');
      },
    }
  );

  const processMutation = useMutation(
    (messageId: string) => {
      if (!currentTenant) {
        throw new Error('No tenant selected');
      }
      return userMessagesApi.process(currentTenant.id, messageId);
    },
    {
      onSuccess: () => {
        toast.success('处理成功');
        queryClient.invalidateQueries(['userMessages', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '处理失败');
      },
    }
  );

  useEffect(() => {
    setPage(1);
  }, [status]);

  const columns: Column<UserMessage>[] = [
    {
      key: 'user.avatarUrl',
      title: '头像',
      width: '80px',
      render: (value: string) =>
        value ? (
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
        ) : (
          <span>默认</span>
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
    {
      key: 'status',
      title: '状态',
      render: (value: string) => (value === 'PROCESSED' ? '已处理' : '待处理'),
    },
    {
      key: 'processedAt',
      title: '处理时间',
      render: (value: string) => (value ? new Date(value).toLocaleString('zh-CN') : '-'),
    },
    {
      key: 'processedBy.username',
      title: '处理人',
      render: (value: any) => value || '-',
    },
  ];

  const hasActionableItems = data?.messages.some(msg => msg.status === 'PENDING');

  if (!isViewer && hasActionableItems) {
    columns.push({
      key: 'actions',
      title: '操作',
      render: (_, record) =>
        record.status === 'PENDING' ? (
          <button
            className={buttonPrimary}
            onClick={() => processMutation.mutate(record.id)}
            disabled={processMutation.isLoading}
          >
            标记为已处理
          </button>
        ) : null,
    });
  }

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
      <div className={styles.filterGroup}>
        <button
          className={clsx(status === 'PENDING' ? buttonPrimary : buttonSecondary)}
          onClick={() => setStatus('PENDING')}
        >
          待处理
        </button>
        <button
          className={clsx(status === 'PROCESSED' ? buttonPrimary : buttonSecondary)}
          onClick={() => setStatus('PROCESSED')}
        >
          已处理
        </button>
      </div>
      <DataTable title="用户留言" columns={columns} data={data?.messages || []} loading={isLoading} />
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={buttonSecondary}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </button>
          <span>
            第 {page} / {totalPages} 页
          </span>
          <button
            className={buttonSecondary}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}; 
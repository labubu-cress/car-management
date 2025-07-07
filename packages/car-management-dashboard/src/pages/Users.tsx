import { Column, DataTable } from '@/components/DataTable';
import * as tableStyles from '@/components/DataTable.css';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api';
import { User } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery } from 'react-query';

export const Users: React.FC = () => {
  const { currentTenant } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery(
    ['users', currentTenant?.id],
    () => (currentTenant ? usersApi.getAll(currentTenant.id) : Promise.resolve([])),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取用户列表失败');
      },
    },
  );

  const { data: userDetails, isLoading: isUserDetailsLoading } = useQuery(
    ['user', currentTenant?.id, selectedUser?.id],
    () => (currentTenant && selectedUser ? usersApi.getById(currentTenant.id, selectedUser.id) : null),
    {
      enabled: !!currentTenant && !!selectedUser,
      onSuccess: (data) => {
        if (data) {
          setIsModalOpen(true);
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取用户详情失败');
        setSelectedUser(null);
      }
    },
  );

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const columns: Column<User>[] = [
    {
      key: 'avatarUrl',
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
      key: 'favoriteCarTrims',
      title: '收藏数',
      width: '100px',
      render: (_, record) => <span>{record.favoritesCount ?? 0}</span>,
    },
    {
      key: 'createdAt',
      title: '注册时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
    {
      key: 'actions',
      title: '操作',
      width: '120px',
      render: (_, record) => (
        <button className={tableStyles.actionButton} onClick={() => handleViewDetails(record)}>
          查看收藏
        </button>
      ),
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
      <DataTable title="用户管理" columns={columns} data={users} loading={isLoading} />
      {isModalOpen && (
        <Modal title={`用户详情 - ${userDetails?.nickname}`} onClose={handleCloseModal} isOpen={isModalOpen}>
          {isUserDetailsLoading ? (
            <p>正在加载...</p>
          ) : userDetails && userDetails.favoriteCarTrims.length > 0 ? (
            <div>
              <h4 style={{ marginTop: 0, marginBottom: '24px' }}>收藏的车型</h4>
              <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0 }}>
                {userDetails.favoriteCarTrims.map((fav) => (
                  <li key={fav.carTrimId} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ marginBottom: '4px' }}>{fav.carTrim.name}</strong>
                      <span style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                        {fav.carTrim.category?.name} ({fav.carTrim.category?.vehicleScenario?.name})
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        收藏于: {new Date(fav.createdAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>该用户暂未收藏任何车型。</p>
          )}
        </Modal>
      )}
    </div>
  );
}; 
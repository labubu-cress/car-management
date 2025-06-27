import { Column, DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { adminUsersApi } from '@/lib/api';
import {
  AdminUser,
  CreateAdminUserInput,
  UpdateAdminUserInput,
} from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as styles from './AdminUsers.css';

interface AdminUserFormData {
  username: string;
  password: string;
  role: 'super_admin' | 'admin' | 'tenant_viewer';
  tenantId?: string;
}

export const AdminUsers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminUserFormData>({
    username: '',
    password: '',
    role: 'admin',
    tenantId: '',
  });

  const { user: currentUser, tenants } = useAuth();
  const queryClient = useQueryClient();

  // 获取管理员用户列表
  const { data: adminUsers = [], isLoading } = useQuery(
    'admin-users',
    adminUsersApi.getAll,
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取管理员用户列表失败');
      },
    }
  );

  // 创建管理员用户
  const createMutation = useMutation(adminUsersApi.create, {
    onSuccess: () => {
      toast.success('管理员用户创建成功');
      queryClient.invalidateQueries('admin-users');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '创建管理员用户失败');
    },
  });

  // 更新管理员用户
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateAdminUserInput }) =>
      adminUsersApi.update(id, data),
    {
      onSuccess: () => {
        toast.success('管理员用户更新成功');
        queryClient.invalidateQueries('admin-users');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新管理员用户失败');
      },
    }
  );

  // 删除管理员用户
  const deleteMutation = useMutation(adminUsersApi.delete, {
    onSuccess: () => {
      toast.success('管理员用户删除成功');
      queryClient.invalidateQueries('admin-users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除管理员用户失败');
    },
  });

  const columns: Column<AdminUser>[] = [
    {
      key: 'username',
      title: '用户名',
      width: '200px',
    },
    {
      key: 'role',
      title: '角色',
      width: '120px',
      render: (value: 'super_admin' | 'admin' | 'tenant_viewer') => {
        const roleMap = {
          super_admin: { text: '超级管理员', className: styles.superAdminRole },
          admin: { text: '管理员', className: styles.adminRole },
          tenant_viewer: { text: '查看员', className: styles.viewerRole },
        };
        const { text, className } = roleMap[value] || roleMap.admin;
        return <span className={className}>{text}</span>;
      },
    },
    {
      key: 'tenantId',
      title: '所属租户',
      width: '200px',
      render: (value: string | null) => {
        if (!value) return <span className={styles.noTenant}>全局</span>;
        const tenant = tenants.find(t => t.id === value);
        return tenant ? tenant.name : value;
      },
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'admin', // 默认只能创建普通管理员
      tenantId: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      tenantId: user.tenantId || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      toast.error('不能删除当前登录的用户');
      return;
    }
    
    if (window.confirm(`确定要删除管理员用户 "${user.username}" 吗？`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast.error('请输入用户名');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('请输入密码');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('密码至少需要6个字符');
      return;
    }

    if (formData.role === 'tenant_viewer' && !formData.tenantId) {
      toast.error('请为查看员选择一个租户');
      return;
    }

    const submitData: Partial<CreateAdminUserInput | UpdateAdminUserInput> = {
      username: formData.username.trim(),
      role: formData.role,
      tenantId: formData.role === 'tenant_viewer' ? formData.tenantId : undefined,
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData as CreateAdminUserInput);
    }
  };

  const handleInputChange = (field: keyof AdminUserFormData, value: string) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === 'role' && value !== 'tenant_viewer') {
        newFormData.tenantId = '';
      }
      return newFormData;
    });
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;
  const canManageUsers = currentUser?.role === 'super_admin';

  if (!canManageUsers) {
    return (
      <div className={styles.container}>
        <div className={styles.noPermission}>
          <h2>权限不足</h2>
          <p>只有超级管理员才能管理管理员用户</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable
        title="管理员用户管理"
        columns={columns}
        data={adminUsers}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="添加管理员"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? '编辑管理员用户' : '添加管理员用户'}
        footer={
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleCloseModal}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faTimes} className={styles.buttonIcon} />
              取消
            </button>
            <button
              type="submit"
              form="admin-user-form"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              <FontAwesomeIcon icon={faCheck} className={styles.buttonIcon} />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        }
      >
        <form id="admin-user-form" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>用户名 *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={styles.input}
              placeholder="请输入用户名"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              密码 {editingUser ? '(留空则不修改)' : '*'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={styles.input}
              placeholder={editingUser ? '留空则不修改密码' : '请输入密码（至少6个字符）'}
              disabled={isSubmitting}
              minLength={6}
            />
            {!editingUser && (
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                密码至少需要6个字符
              </small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>角色</label>
            <select
              value={formData.role}
              onChange={(e) =>
                handleInputChange(
                  'role',
                  e.target.value as 'super_admin' | 'admin' | 'tenant_viewer'
                )
              }
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="super_admin">超级管理员</option>
              <option value="admin">管理员</option>
              <option value="tenant_viewer">查看员</option>
            </select>
          </div>

          {formData.role === 'tenant_viewer' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>所属租户 *</label>
              <select
                value={formData.tenantId || ''}
                onChange={(e) => handleInputChange('tenantId', e.target.value)}
                className={styles.select}
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  请选择一个租户
                </option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}; 
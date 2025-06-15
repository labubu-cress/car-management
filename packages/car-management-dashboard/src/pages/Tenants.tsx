import { Column, DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { tenantsApi } from '@/lib/api';
import { Tenant, UpdateTenantInput } from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as styles from './Tenants.css';

interface TenantFormData {
  name: string;
  appId: string;
  appSecret: string;
  status: 'active' | 'inactive';
}

export const Tenants: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    appId: '',
    appSecret: '',
    status: 'active',
  });

  const queryClient = useQueryClient();

  // 获取租户列表
  const { data: tenants = [], isLoading } = useQuery(
    'tenants',
    tenantsApi.getAll,
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取租户列表失败');
      },
    }
  );

  // 创建租户
  const createMutation = useMutation(tenantsApi.create, {
    onSuccess: () => {
      toast.success('租户创建成功');
      queryClient.invalidateQueries('tenants');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '创建租户失败');
    },
  });

  // 更新租户
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateTenantInput }) =>
      tenantsApi.update(id, data),
    {
      onSuccess: () => {
        toast.success('租户更新成功');
        queryClient.invalidateQueries('tenants');
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新租户失败');
      },
    }
  );

  // 删除租户
  const deleteMutation = useMutation(tenantsApi.delete, {
    onSuccess: () => {
      toast.success('租户删除成功');
      queryClient.invalidateQueries('tenants');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除租户失败');
    },
  });

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      title: '租户名称',
      width: '200px',
    },
    {
      key: 'appId',
      title: '应用ID',
      width: '150px',
    },
    {
      key: 'appSecret',
      title: '应用密钥',
      width: '200px',
      render: (value: string) => (
        <span className={styles.secret}>
          {value.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '100px',
      render: (value: string) => (
        <span className={value === 'active' ? styles.activeStatus : styles.inactiveStatus}>
          {value === 'active' ? '活跃' : '停用'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      appId: '',
      appSecret: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      appId: tenant.appId,
      appSecret: tenant.appSecret,
      status: tenant.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    if (window.confirm(`确定要删除租户 "${tenant.name}" 吗？`)) {
      deleteMutation.mutate(tenant.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.appId || !formData.appSecret) {
      toast.error('请填写所有必填字段');
      return;
    }

    if (editingTenant) {
      updateMutation.mutate({
        id: editingTenant.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof TenantFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className={styles.container}>
      <DataTable
        title="租户管理"
        columns={columns}
        data={tenants}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="添加租户"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTenant ? '编辑租户' : '添加租户'}
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
              form="tenant-form"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              <FontAwesomeIcon icon={faCheck} className={styles.buttonIcon} />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        }
      >
        <form id="tenant-form" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>租户名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
              placeholder="请输入租户名称"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>应用ID *</label>
            <input
              type="text"
              value={formData.appId}
              onChange={(e) => handleInputChange('appId', e.target.value)}
              className={styles.input}
              placeholder="请输入应用ID"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>应用密钥 *</label>
            <input
              type="password"
              value={formData.appSecret}
              onChange={(e) => handleInputChange('appSecret', e.target.value)}
              className={styles.input}
              placeholder="请输入应用密钥"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>状态</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
              className={styles.select}
              disabled={isSubmitting}
            >
              <option value="active">活跃</option>
              <option value="inactive">停用</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}; 
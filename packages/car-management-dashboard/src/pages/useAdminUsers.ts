import { useAuth } from '@/contexts/AuthContext';
import { adminUsersApi } from '@/lib/api';
import {
    AdminUser,
    CreateAdminUserInput,
    UpdateAdminUserInput,
} from '@/types/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export interface AdminUserFormData {
  username: string;
  password: string;
  role: 'super_admin' | 'admin' | 'tenant_viewer';
  tenantId?: string;
}

export const useAdminUsers = () => {
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

  const { data: adminUsers = [], isLoading } = useQuery(
    'admin-users',
    adminUsersApi.getAll,
    {
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取管理员用户列表失败');
      },
    }
  );

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

  const deleteMutation = useMutation(adminUsersApi.delete, {
    onSuccess: () => {
      toast.success('管理员用户删除成功');
      queryClient.invalidateQueries('admin-users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除管理员用户失败');
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'admin',
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
      tenantId:
        formData.role === 'tenant_viewer' ? formData.tenantId : undefined,
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

  const handleInputChange = (
    field: keyof AdminUserFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };
      if (field === 'role' && value !== 'tenant_viewer') {
        newFormData.tenantId = '';
      }
      return newFormData;
    });
  };

  return {
    adminUsers,
    isLoading,
    isModalOpen,
    editingUser,
    formData,
    tenants,
    currentUser,
    isSubmitting: createMutation.isLoading || updateMutation.isLoading,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleSubmit,
    handleInputChange,
  };
}; 
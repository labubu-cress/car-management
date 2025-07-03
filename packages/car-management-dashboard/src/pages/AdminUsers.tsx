import { DataTable } from '@/components/DataTable';
import React from 'react';
import { AdminUserForm } from './AdminUserForm';
import * as styles from './AdminUsers.css';
import { getAdminUsersColumns } from './AdminUsersColumns';
import { useAdminUsers } from './useAdminUsers';

export const AdminUsers: React.FC = () => {
  const {
    adminUsers,
    isLoading,
    isModalOpen,
    editingUser,
    formData,
    tenants,
    currentUser,
    isSubmitting,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCloseModal,
    handleSubmit,
    handleInputChange,
  } = useAdminUsers();

  const canManageUsers = currentUser?.role === 'super_admin';
  const columns = getAdminUsersColumns(tenants);

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

      <AdminUserForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingUser={editingUser}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        tenants={tenants}
      />
    </div>
  );
}; 
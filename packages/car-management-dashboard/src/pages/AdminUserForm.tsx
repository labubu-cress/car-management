import { Modal } from '@/components/Modal';
import { AdminUser } from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import * as styles from './AdminUsers.css';
import { AdminUserFormData } from './useAdminUsers';

interface Tenant {
  id: string;
  name: string;
}
interface AdminUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: AdminUser | null;
  formData: AdminUserFormData;
  handleInputChange: (field: keyof AdminUserFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  tenants: Tenant[];
}

export const AdminUserForm: React.FC<AdminUserFormProps> = ({
  isOpen,
  onClose,
  editingUser,
  formData,
  handleInputChange,
  handleSubmit,
  isSubmitting,
  tenants,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? '编辑管理员用户' : '添加管理员用户'}
      footer={
        <div className={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
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
      <form
        id="admin-user-form"
        onSubmit={handleSubmit}
        className={styles.form}
      >
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
            placeholder={
              editingUser ? '留空则不修改密码' : '请输入密码（至少6个字符）'
            }
            disabled={isSubmitting}
            minLength={6}
          />
          {!editingUser && (
            <small
              style={{
                color: '#666',
                fontSize: '12px',
                marginTop: '4px',
                display: 'block',
              }}
            >
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
  );
}; 
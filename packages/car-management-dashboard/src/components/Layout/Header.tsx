import { useAuth } from '@/contexts/AuthContext';
import { faBuilding, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import * as styles from './Header.css';

export const Header: React.FC = () => {
  const { user, currentTenant, tenants, logout, selectTenant, isViewer } = useAuth();

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTenant = tenants.find(t => t.id === e.target.value);
    if (selectedTenant) {
      selectTenant(selectedTenant);
    }
  };

  const isDisabled = tenants.length <= 1 || isViewer;

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return '超级管理员';
      case 'admin':
        return '管理员';
      case 'tenant_viewer':
        return '访问者';
      default:
        return '';
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.tenantSelector}>
          <FontAwesomeIcon icon={faBuilding} className={styles.tenantIcon} />
          <div className={styles.selectWrapper}>
            <select
              value={currentTenant?.id || ''}
              onChange={handleTenantChange}
              className={styles.tenantSelect}
              disabled={isDisabled}
            >
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.username}>{user?.username}</span>
          <span className={styles.role}>{getRoleName(user?.role)}</span>
        </div>
        <button onClick={logout} className={styles.logoutButton}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          退出
        </button>
      </div>
    </header>
  );
}; 
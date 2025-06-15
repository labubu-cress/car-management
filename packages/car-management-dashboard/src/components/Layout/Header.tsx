import { useAuth } from '@/contexts/AuthContext';
import { faBuilding, faChevronDown, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import * as styles from './Header.css';

export const Header: React.FC = () => {
  const { user, currentTenant, tenants, logout, selectTenant } = useAuth();

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTenant = tenants.find(t => t.id === e.target.value);
    if (selectedTenant) {
      selectTenant(selectedTenant);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.tenantSelector}>
          <FontAwesomeIcon icon={faBuilding} className={styles.tenantIcon} />
          <select
            value={currentTenant?.id || ''}
            onChange={handleTenantChange}
            className={styles.tenantSelect}
          >
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <FontAwesomeIcon icon={faChevronDown} className={styles.chevronIcon} />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <span className={styles.username}>{user?.username}</span>
          <span className={styles.role}>
            {user?.role === 'super_admin' ? '超级管理员' : '管理员'}
          </span>
        </div>
        <button onClick={logout} className={styles.logoutButton}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          退出
        </button>
      </div>
    </header>
  );
}; 
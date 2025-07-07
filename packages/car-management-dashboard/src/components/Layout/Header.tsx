import { useAuth } from '@/contexts/AuthContext';
import { faBuilding, faChevronDown, faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as styles from './Header.css';

export const Header: React.FC = () => {
  const { user, currentTenant, tenants, logout, selectTenant, isViewer } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTenant = tenants.find(t => t.id === e.target.value);
    if (selectedTenant) {
      selectTenant(selectedTenant);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <div ref={dropdownRef}>
          <div className={styles.userInfo} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div className={styles.userDetails}>
              <span className={styles.username}>{user?.username}</span>
              <span className={styles.role}>{getRoleName(user?.role)}</span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ''}`}
            />
          </div>
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItem} onClick={() => navigate('/change-password')}>
                <FontAwesomeIcon icon={faKey} />
                <span>修改密码</span>
              </div>
              <div className={styles.dropdownItem} onClick={logout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>退出</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}; 
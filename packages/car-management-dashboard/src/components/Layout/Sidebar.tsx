import { useAuth } from '@/contexts/AuthContext';
import {
    faBuilding,
    faCar,
    faCogs,
    faImage,
    faLayerGroup,
    faPhone,
    faTachometerAlt,
    faUsers,
    faUserShield,
    faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as styles from './Sidebar.css';

interface MenuItem {
  path: string;
  label: string;
  icon: any;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: '仪表盘', icon: faTachometerAlt },
  { path: '/tenants', label: '租户管理', icon: faBuilding },
  { path: '/admin-users', label: '管理员', icon: faUserShield },
  { path: '/vehicle-scenarios', label: '分类管理', icon: faImage },
  { path: '/car-categories', label: '车型管理', icon: faLayerGroup },
  { path: '/car-trims', label: '参数管理', icon: faCogs },
  { path: '/users', label: '用户管理', icon: faUsers },
  { path: '/homepage-config', label: '首页配置', icon: faWrench },
  { path: '/contact-us-config', label: '联系我们', icon: faPhone },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredMenuItems =
    user?.role === 'admin'
      ? menuItems.filter(
          (item) => item.label !== '租户管理' && item.label !== '管理员'
        )
      : menuItems;

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <FontAwesomeIcon icon={faCar} className={styles.logoIcon} />
        <span className={styles.logoText}>汽车管理</span>
      </div>

      <nav className={styles.nav}>
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.navItemActive : ''
            }`}
          >
            <FontAwesomeIcon icon={item.icon} className={styles.navIcon} />
            <span className={styles.navText}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}; 
import {
    faBuilding,
    faCar,
    faCogs,
    faImage,
    faLayerGroup,
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
  { path: '/vehicle-scenarios', label: '车辆场景', icon: faImage },
  { path: '/car-categories', label: '车辆分类', icon: faLayerGroup },
  { path: '/car-trims', label: '车型配置', icon: faCogs },
  { path: '/users', label: '用户管理', icon: faUsers },
  { path: '/homepage-config', label: '首页配置', icon: faWrench },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <FontAwesomeIcon icon={faCar} className={styles.logoIcon} />
        <span className={styles.logoText}>汽车管理</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
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
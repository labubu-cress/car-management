import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api';
import {
  faBuilding,
  faCar,
  faCheckCircle,
  faCubes,
  faExclamationCircle,
  faHeart,
  faLayerGroup,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import * as styles from './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { currentTenant } = useAuth();
  const navigate = useNavigate();

  const { data: statsData, isLoading } = useQuery(
    ['dashboard-stats', currentTenant?.id],
    () => (currentTenant ? dashboardApi.getStats(currentTenant.id) : null),
    {
      enabled: !!currentTenant,
    },
  );

  const stats = [
    { title: '当前小程序', value: currentTenant?.name || '-', icon: faBuilding, color: '#1890ff', path: '/tenants' },
    { title: '用户总数', value: statsData?.usersCount ?? '0', icon: faUsers, color: '#52c41a', path: '/users' },
    { title: '总收藏数', value: statsData?.favoritesCount ?? '0', icon: faHeart, color: '#eb2f96' },
    {
      title: '分类总数',
      value: statsData?.vehicleScenariosCount ?? '0',
      icon: faCubes,
      color: '#13c2c2',
      path: '/vehicle-scenarios',
    },
    {
      title: '车型总数',
      value: statsData?.carCategoriesCount ?? '0',
      icon: faLayerGroup,
      color: '#faad14',
      path: '/car-categories',
    },
    { title: '参数总数', value: statsData?.carTrimsCount ?? '0', icon: faCar, color: '#722ed1', path: '/car-trims' },
    {
      title: '待处理留言',
      value: statsData?.pendingUserMessagesCount ?? '0',
      icon: faExclamationCircle,
      color: '#f5222d',
      path: '/user-messages?status=PENDING',
    },
    {
      title: '已处理留言',
      value: statsData?.processedUserMessagesCount ?? '0',
      icon: faCheckCircle,
      color: '#52c41a',
      path: '/user-messages?status=PROCESSED',
    },
  ];

  const quickActions = [
    {
      title: '1. 配置首页',
      description: '管理首页的轮播图和推荐内容',
      path: '/homepage-config',
    },
    {
      title: '2. 配置车辆分类',
      description: '创建各种车辆分类，定义您的服务范围',
      path: '/vehicle-scenarios',
    },
    {
      title: '3. 添加车系',
      description: '创建车系，包括图片、标签和亮点信息',
      path: '/car-categories',
    },
    {
      title: '4. 配置车型',
      description: '为每个车系添加具体的车型和价格信息',
      path: '/car-trims',
    },
    {
      title: '5. 联系我们',
      description: '配置联系方式和地址等信息',
      path: '/contact-us-config',
    },
    {
      title: '6. 常见问题',
      description: '管理用户常见问题和解答',
      path: '/faqs',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>仪表盘</h1>
        <p className={styles.subtitle}>欢迎使用汽车管理后台</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={styles.statCard}
            onClick={() => {
              if (stat.path) {
                navigate(stat.path);
              }
            }}
          >
            <div className={styles.statIcon} style={{ backgroundColor: `${stat.color}20` }}>
              <FontAwesomeIcon icon={stat.icon} style={{ color: stat.color }} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{isLoading && stat.title !== '当前租户' ? '加载中...' : stat.value}</div>
              <div className={styles.statTitle}>{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>快速开始</h2>
          <div className={styles.quickActions}>
            {quickActions.map((action) => (
              <div key={action.title} className={styles.quickAction} onClick={() => navigate(action.path)}>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 
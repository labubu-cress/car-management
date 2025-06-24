import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api';
import {
  faBuilding,
  faCar,
  faCheckCircle,
  faCubes,
  faExclamationCircle,
  faLayerGroup,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useQuery } from 'react-query';
import * as styles from './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { currentTenant } = useAuth();

  const { data: statsData, isLoading } = useQuery(
    ['dashboard-stats', currentTenant?.id],
    () => (currentTenant ? dashboardApi.getStats(currentTenant.id) : null),
    {
      enabled: !!currentTenant,
    },
  );

  const stats = [
    { title: '当前租户', value: currentTenant?.name || '-', icon: faBuilding, color: '#1890ff' },
    { title: '用户总数', value: statsData?.usersCount ?? '0', icon: faUsers, color: '#52c41a' },
    { title: '分类总数', value: statsData?.vehicleScenariosCount ?? '0', icon: faCubes, color: '#13c2c2' },
    { title: '车型总数', value: statsData?.carCategoriesCount ?? '0', icon: faLayerGroup, color: '#faad14' },
    { title: '参数总数', value: statsData?.carTrimsCount ?? '0', icon: faCar, color: '#722ed1' },
    {
      title: '待处理留言',
      value: statsData?.pendingUserMessagesCount ?? '0',
      icon: faExclamationCircle,
      color: '#f5222d',
    },
    {
      title: '已处理留言',
      value: statsData?.processedUserMessagesCount ?? '0',
      icon: faCheckCircle,
      color: '#52c41a',
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
          <div key={index} className={styles.statCard}>
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
            <div className={styles.quickAction}>
              <h3>1. 管理租户</h3>
              <p>创建和管理不同的租户，每个租户都有独立的数据空间</p>
            </div>
            <div className={styles.quickAction}>
              <h3>2. 配置车辆分类</h3>
              <p>创建各种车辆分类，定义您的服务范围</p>
            </div>
            <div className={styles.quickAction}>
              <h3>3. 添加车型</h3>
              <p>创建车型，包括图片、标签和亮点信息</p>
            </div>
            <div className={styles.quickAction}>
              <h3>4. 配置车型参数</h3>
              <p>为每个车型添加具体的车型参数和价格信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
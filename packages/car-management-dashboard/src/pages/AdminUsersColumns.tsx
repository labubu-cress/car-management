import { Column } from '@/components/DataTable';
import { AdminUser } from '@/types/api';
import * as styles from './AdminUsers.css';

interface Tenant {
  id: string;
  name: string;
}

export const getAdminUsersColumns = (
  tenants: Tenant[]
): Column<AdminUser>[] => [
  {
    key: 'username',
    title: '用户名',
    width: '200px',
  },
  {
    key: 'role',
    title: '角色',
    width: '120px',
    render: (value: 'super_admin' | 'admin' | 'tenant_viewer') => {
      const roleMap = {
        super_admin: { text: '超级管理员', className: styles.superAdminRole },
        admin: { text: '管理员', className: styles.adminRole },
        tenant_viewer: { text: '查看员', className: styles.viewerRole },
      };
      const { text, className } = roleMap[value] || roleMap.admin;
      return <span className={className}>{text}</span>;
    },
  },
  {
    key: 'tenantId',
    title: '所属租户',
    width: '200px',
    render: (value: string | null) => {
      if (!value) return <span className={styles.noTenant}>全局</span>;
      const tenant = tenants.find((t) => t.id === value);
      return tenant ? tenant.name : value;
    },
  },
  {
    key: 'createdAt',
    title: '创建时间',
    width: '180px',
    render: (value: string) => new Date(value).toLocaleString('zh-CN'),
  },
]; 
import { Column } from '@/components/DataTable';
import { CarCategory } from '@/types/api';

export const columns: Column<CarCategory>[] = [
  {
    key: 'image',
    title: '图片',
    width: '100px',
    render: (value: string) => (
      <img src={value} alt="车型图片" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
    ),
  },
  {
    key: 'name',
    title: '车型名称',
    width: '200px',
  },
  {
    key: 'minPrice',
    title: '最低价格',
    width: '120px',
    render: (value?: number) => (value ? `¥${value.toLocaleString()}` : '-'),
  },
  {
    key: 'maxPrice',
    title: '最高价格',
    width: '120px',
    render: (value?: number) => (value ? `¥${value.toLocaleString()}` : '-'),
  },
  {
    key: 'vehicleScenario.name',
    title: '所属分类',
    width: '150px',
  },
  {
    key: 'badge',
    title: '标签',
    width: '120px',
  },
  {
    key: 'tags',
    title: '标签组',
    render: (value: string[]) => value?.join(', ') || '-',
  },
  {
    key: 'isArchived',
    title: '状态',
    width: '100px',
    render: (isArchived: boolean) => (
      <span
        style={{
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: isArchived ? '#fef2f2' : '#ecfdf5',
          color: isArchived ? '#ef4444' : '#10b981',
          whiteSpace: 'nowrap',
        }}
      >
        {isArchived ? '已下架' : '销售中'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    title: '创建时间',
    width: '180px',
    render: (value: string) => new Date(value).toLocaleString('zh-CN'),
  },
]; 
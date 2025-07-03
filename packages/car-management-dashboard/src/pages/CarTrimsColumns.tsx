import { Column } from '@/components/DataTable';
import { CarTrim } from '@/types/api';

export const columns: Column<CarTrim>[] = [
  {
    key: 'image',
    title: '图片',
    width: '100px',
    render: (value: string) => (
      <img
        src={value}
        alt="车型参数图片"
        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
      />
    ),
  },
  {
    key: 'configImageUrl',
    title: '配置图片',
    width: '100px',
    render: (value: string) =>
      value ? (
        <img
          src={value}
          alt="配置参数图片"
          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        '未上传'
      ),
  },
  {
    key: 'name',
    title: '名称',
    width: '200px',
  },
  {
    key: 'subtitle',
    title: '副标题',
    width: '200px',
  },
  {
    key: 'originalPrice',
    title: '原价',
    width: '120px',
  },
  {
    key: 'currentPrice',
    title: '现价',
    width: '120px',
    render: (value: string, record: CarTrim) => (
      <span style={{ color: '#f50', fontWeight: '600' }}>{record.priceOverrideText || value}</span>
    ),
  },
  {
    key: 'badge',
    title: '标签',
    width: '100px',
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
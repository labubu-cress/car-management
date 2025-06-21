import { Column, DataTable } from '@/components/DataTable';
import { FormField } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { faqsApi } from '@/lib/api';
import { Faq, UpdateFaqInput } from '@/types/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as styles from './Faqs.css';

interface FaqFormData {
  question: string;
  answer: string;
}

export const Faqs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [formData, setFormData] = useState<FaqFormData>({
    question: '',
    answer: '',
  });

  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id;
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery(
    ['faqs', tenantId],
    () => faqsApi.getAll(tenantId!),
    {
      enabled: !!tenantId,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取常见问题列表失败');
      },
    }
  );

  const createMutation = useMutation(
    (data: FaqFormData) => faqsApi.create(tenantId!, data),
    {
      onSuccess: () => {
        toast.success('创建成功');
        queryClient.invalidateQueries(['faqs', tenantId]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建失败');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateFaqInput }) =>
      faqsApi.update(tenantId!, id, data),
    {
      onSuccess: () => {
        toast.success('更新成功');
        queryClient.invalidateQueries(['faqs', tenantId]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新失败');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => faqsApi.delete(tenantId!, id),
    {
      onSuccess: () => {
        toast.success('删除成功');
        queryClient.invalidateQueries(['faqs', tenantId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除失败');
      },
    }
  );

  const columns: Column<Faq>[] = [
    {
      key: 'question',
      title: '问题',
    },
    {
      key: 'answer',
      title: '答案',
    },
    {
      key: 'createdAt',
      title: '创建时间',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setIsModalOpen(true);
  };

  const handleDelete = (faq: Faq) => {
    if (window.confirm(`确定要删除问题 "${faq.question}" 吗？`)) {
      deleteMutation.mutate(faq.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    field: keyof FaqFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className={styles.container}>
      <DataTable
        title="常见问题管理"
        columns={columns}
        data={faqs}
        loading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="添加问题"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFaq ? '编辑问题' : '添加问题'}
      >
        <form onSubmit={handleSubmit}>
          <FormField label="问题">
            <input
              type="text"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              required
            />
          </FormField>
          <FormField label="答案">
            <textarea
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              rows={5}
              required
            />
          </FormField>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Faqs; 
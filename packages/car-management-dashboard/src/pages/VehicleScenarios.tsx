import { Column, DataTable } from '@/components/DataTable';
import { ImageUpload } from '@/components/ImageUpload';
import { Modal } from '@/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleScenariosApi } from '@/lib/api';
import { CreateVehicleScenarioInput, UpdateVehicleScenarioInput, VehicleScenario } from '@/types/api';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import * as styles from './VehicleScenarios.css';

interface VehicleScenarioFormData {
  name: string;
  description: string;
  image: string;
}

export const VehicleScenarios: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<VehicleScenario | null>(null);
  const [formData, setFormData] = useState<VehicleScenarioFormData>({
    name: '',
    description: '',
    image: '',
  });

  const { currentTenant, isViewer } = useAuth();
  const queryClient = useQueryClient();

  // 获取车辆分类列表
  const { data: scenarios = [], isLoading } = useQuery(
    ['vehicle-scenarios', currentTenant?.id],
    () => currentTenant ? vehicleScenariosApi.getAll(currentTenant.id) : Promise.resolve([]),
    {
      enabled: !!currentTenant,
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '获取车辆分类列表失败');
      },
    }
  );

  // 创建车辆分类
  const createMutation = useMutation(
    (data: CreateVehicleScenarioInput) => 
      currentTenant ? vehicleScenariosApi.create(currentTenant.id, data) : Promise.reject('No tenant'),
    {
      onSuccess: () => {
        toast.success('车辆分类创建成功');
        queryClient.invalidateQueries(['vehicle-scenarios', currentTenant?.id]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '创建车辆分类失败');
      },
    }
  );

  // 更新车辆分类
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: UpdateVehicleScenarioInput }) =>
      currentTenant ? vehicleScenariosApi.update(currentTenant.id, id, data) : Promise.reject('No tenant'),
    {
      onSuccess: () => {
        toast.success('车辆分类更新成功');
        queryClient.invalidateQueries(['vehicle-scenarios', currentTenant?.id]);
        handleCloseModal();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新车辆分类失败');
      },
    }
  );

  // 删除车辆分类
  const deleteMutation = useMutation(
    (id: string) => 
      currentTenant ? vehicleScenariosApi.delete(currentTenant.id, id) : Promise.reject('No tenant'),
    {
      onSuccess: () => {
        toast.success('车辆分类删除成功');
        queryClient.invalidateQueries(['vehicle-scenarios', currentTenant?.id]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '删除车辆分类失败');
      },
    }
  );

  const columns: Column<VehicleScenario>[] = [
    {
      key: 'image',
      title: '图片',
      width: '100px',
      render: (value: string) => (
        <img src={value} alt="分类图片" className={styles.scenarioImage} />
      ),
    },
    {
      key: 'name',
      title: '分类名称',
      width: '200px',
    },
    {
      key: 'description',
      title: '描述',
      render: (value: string) => (
        <div className={styles.description}>{value}</div>
      ),
    },
    {
      key: 'createdAt',
      title: '创建时间',
      width: '180px',
      render: (value: string) => new Date(value).toLocaleString('zh-CN'),
    },
  ];

  const handleAdd = () => {
    setEditingScenario(null);
    setFormData({
      name: '',
      description: '',
      image: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (scenario: VehicleScenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description,
      image: scenario.image,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (scenario: VehicleScenario) => {
    if (window.confirm(`确定要删除车辆分类 "${scenario.name}" 吗？`)) {
      deleteMutation.mutate(scenario.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingScenario(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('请输入分类描述');
      return;
    }

    if (!formData.image.trim()) {
      toast.error('请上传分类图片');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
    };

    if (editingScenario) {
      updateMutation.mutate({
        id: editingScenario.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleInputChange = (field: keyof VehicleScenarioFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isLoading || updateMutation.isLoading;

  if (!currentTenant) {
    return (
      <div className={styles.container}>
        <div className={styles.noTenant}>
          <h2>请选择租户</h2>
          <p>请先选择一个租户来管理车辆分类</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DataTable
        title="车辆分类管理"
        columns={columns}
        data={scenarios}
        loading={isLoading}
        onAdd={!isViewer ? handleAdd : undefined}
        onEdit={!isViewer ? handleEdit : undefined}
        onDelete={!isViewer ? handleDelete : undefined}
        addButtonText="添加分类"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingScenario ? '编辑车辆分类' : '添加车辆分类'}
        footer={
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={handleCloseModal}
              className={styles.cancelButton}
            >
              <FontAwesomeIcon icon={faTimes} className={styles.buttonIcon} />
              取消
            </button>
            <button
              type="submit"
              form="scenario-form"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              <FontAwesomeIcon icon={faCheck} className={styles.buttonIcon} />
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        }
      >
        <form id="scenario-form" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>分类名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
              placeholder="请输入分类名称"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>分类描述 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.textarea}
              placeholder="请输入分类描述"
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>分类图片 *</label>
            <ImageUpload
              value={formData.image}
              onChange={(url: string) => handleInputChange('image', url)}
              tenantId={currentTenant.id}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}; 
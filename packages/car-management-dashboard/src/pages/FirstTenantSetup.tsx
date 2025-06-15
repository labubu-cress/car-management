import { useAuth } from '@/contexts/AuthContext';
import { tenantsApi } from '@/lib/api';
import { faBuilding, faCheck, faKey, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as styles from './FirstTenantSetup.css';

export const FirstTenantSetup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    appId: '',
    appSecret: '',
    status: 'active' as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { refreshTenants } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('请输入租户名称');
      return;
    }

    if (!formData.appId.trim()) {
      toast.error('请输入应用ID');
      return;
    }

    if (!formData.appSecret.trim()) {
      toast.error('请输入应用密钥');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      appId: formData.appId.trim(),
      appSecret: formData.appSecret.trim(),
      status: formData.status,
    };

    setIsLoading(true);
    try {
      await tenantsApi.create(submitData);
      toast.success('租户创建成功！');
      await refreshTenants();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建租户失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.setupBox}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faBuilding} className={styles.headerIcon} />
          </div>
          <h1 className={styles.title}>欢迎使用汽车管理系统</h1>
          <p className={styles.subtitle}>
            您需要先创建第一个租户来开始使用系统
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>创建租户</h3>
              <p>设置您的第一个租户信息</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>配置应用</h3>
              <p>设置应用ID和密钥</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>开始使用</h3>
              <p>进入管理后台</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faTag} className={styles.labelIcon} />
              租户名称 *
            </label>
            <input
              type="text"
              placeholder="请输入租户名称，如：我的汽车公司"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faKey} className={styles.labelIcon} />
              应用ID *
            </label>
            <input
              type="text"
              placeholder="请输入应用ID"
              value={formData.appId}
              onChange={(e) => handleInputChange('appId', e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <FontAwesomeIcon icon={faKey} className={styles.labelIcon} />
              应用密钥 *
            </label>
            <input
              type="password"
              placeholder="请输入应用密钥"
              value={formData.appSecret}
              onChange={(e) => handleInputChange('appSecret', e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            <FontAwesomeIcon 
              icon={isLoading ? faCheck : faPlus} 
              className={styles.buttonIcon} 
            />
            {isLoading ? '创建中...' : '创建租户'}
          </button>
        </form>

        <div className={styles.tips}>
          <h4 className={styles.tipsTitle}>提示：</h4>
          <ul className={styles.tipsList}>
            <li className={styles.tipsItem}>租户名称将显示在系统中，建议使用您的公司或组织名称</li>
            <li className={styles.tipsItem}>应用ID和密钥用于API访问，请妥善保管</li>
            <li className={styles.tipsItem}>创建后可以在租户管理页面进行修改</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 
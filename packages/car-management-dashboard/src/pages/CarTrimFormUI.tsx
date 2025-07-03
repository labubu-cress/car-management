import { FormField } from '@/components/FormField';
import { formFieldStyles } from '@/components/FormField.css';
import { HighlightInput } from '@/components/HighlightInput';
import { ImageUpload } from '@/components/ImageUpload';
import React from 'react';
import { carTrimFormStyles } from './CarTrimForm.css';
import { useCarTrimForm } from './useCarTrimForm';

type CarTrimFormUIProps = ReturnType<typeof useCarTrimForm>;

export const CarTrimFormUI: React.FC<CarTrimFormUIProps> = ({
  isEdit,
  formData,
  setFormData,
  errors,
  categories,
  isSubmitting,
  handleSubmit,
  handleBack,
  currentTenant,
  isViewer,
}) => {
  return (
    <div className={carTrimFormStyles.container}>
      <div className={carTrimFormStyles.header}>
        <h1 className={carTrimFormStyles.title}>{isEdit ? '编辑车型参数' : '创建车型参数'}</h1>
        <button onClick={handleBack} className={carTrimFormStyles.backButton}>
          返回参数列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className={carTrimFormStyles.form}>
        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>基本信息</h2>

          <FormField label="所属车型" required error={errors.categoryId}>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className={formFieldStyles.select}
              disabled={isSubmitting || isViewer}
            >
              <option value="" disabled>
                请选择车型
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="车型参数名称" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入车型参数名称"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="副标题" required error={errors.subtitle}>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入副标题"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="配置参数详情图片" error={errors.configImageUrl}>
            <ImageUpload
              value={formData.configImageUrl}
              onChange={(url) => setFormData({ ...formData, configImageUrl: url })}
              tenantId={currentTenant!.id}
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="优惠政策亮点" required error={errors.badge}>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入优惠政策亮点，例如：金融贴息至高8000元"
              disabled={isSubmitting || isViewer}
            />
          </FormField>
        </div>

        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>价格信息</h2>

          <FormField label="原价" required error={errors.originalPrice}>
            <input
              type="text"
              inputMode="decimal"
              value={formData.originalPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, originalPrice: value });
                }
              }}
              className={formFieldStyles.input}
              placeholder="请输入厂商指导价"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="现价" required error={errors.currentPrice}>
            <input
              type="text"
              value={formData.priceOverrideText || formData.currentPrice}
              onChange={(e) => {
                const value = e.target.value;
                const isNumeric = value === '' || !isNaN(Number(value));
                if (isNumeric) {
                  setFormData({ ...formData, currentPrice: value, priceOverrideText: '' });
                } else {
                  setFormData({ ...formData, priceOverrideText: value });
                }
              }}
              className={formFieldStyles.input}
              placeholder="请输入当前售价或说明文字"
              disabled={isSubmitting || isViewer}
            />
          </FormField>
        </div>

        <div className={carTrimFormStyles.section}>
          <h2 className={carTrimFormStyles.sectionTitle}>车型参数特色</h2>
          <FormField label="特色功能">
            <HighlightInput
              value={formData.features}
              onChange={(features) => setFormData({ ...formData, features })}
              placeholder={{ title: '功能名称', icon: '功能描述' }}
              disabled={isSubmitting || isViewer}
            />
          </FormField>
        </div>

        <div className={carTrimFormStyles.actions}>
          <button
            type="button"
            onClick={handleBack}
            className={carTrimFormStyles.cancelButton}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className={carTrimFormStyles.submitButton}
            disabled={isSubmitting || isViewer}
          >
            {isSubmitting ? '保存中...' : isEdit ? '更新配置' : '创建配置'}
          </button>
        </div>
      </form>
    </div>
  );
}; 
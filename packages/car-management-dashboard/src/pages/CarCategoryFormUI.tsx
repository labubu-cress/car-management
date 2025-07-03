import { FormField } from '@/components/FormField';
import { formFieldStyles } from '@/components/FormField.css';
import { HighlightInput } from '@/components/HighlightInput';
import { ImageUpload } from '@/components/ImageUpload';
import { MultiImageUpload } from '@/components/MultiImageUpload';
import { TagInput } from '@/components/TagInput';
import React from 'react';
import { carCategoryFormStyles } from './CarCategoryForm.css';
import { useCarCategoryForm } from './useCarCategoryForm';

type CarCategoryFormUIProps = {
  isEdit: boolean;
  formData: ReturnType<typeof useCarCategoryForm>['formData'];
  setFormData: ReturnType<typeof useCarCategoryForm>['setFormData'];
  errors: ReturnType<typeof useCarCategoryForm>['errors'];
  scenarios: { id: string; name: string }[];
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleBack: () => void;
  currentTenant: { id: string } | null;
  isViewer: boolean;
};

export const CarCategoryFormUI: React.FC<CarCategoryFormUIProps> = ({
  isEdit,
  formData,
  setFormData,
  errors,
  scenarios,
  isSubmitting,
  handleSubmit,
  handleBack,
  currentTenant,
  isViewer,
}) => {
  return (
    <div className={carCategoryFormStyles.container}>
      <div className={carCategoryFormStyles.header}>
        <h1 className={carCategoryFormStyles.title}>{isEdit ? '编辑车型' : '创建车型'}</h1>
        <button onClick={handleBack} className={carCategoryFormStyles.backButton}>
          返回车型列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className={carCategoryFormStyles.form}>
        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>基本信息</h2>

          <FormField label="所属分类" required error={errors.vehicleScenarioId}>
            <select
              value={formData.vehicleScenarioId}
              onChange={(e) => setFormData({ ...formData, vehicleScenarioId: e.target.value })}
              className={formFieldStyles.select}
              disabled={isSubmitting || isViewer}
            >
              <option value="" disabled>
                请选择车辆分类
              </option>
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="车型名称" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={formFieldStyles.input}
              placeholder="请输入车型名称"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="最低价格">
            <input
              type="number"
              value={formData.minPrice}
              onChange={(e) => setFormData({ ...formData, minPrice: Number(e.target.value) })}
              className={formFieldStyles.input}
              placeholder="请输入最低价格"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="最高价格">
            <input
              type="number"
              value={formData.maxPrice}
              onChange={(e) => setFormData({ ...formData, maxPrice: Number(e.target.value) })}
              className={formFieldStyles.input}
              placeholder="请输入最高价格"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="角标 (Badge)">
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className={formFieldStyles.input}
              placeholder="例如：热门推荐"
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="标签组 (Tags)">
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="亮点 (Highlights)">
            <HighlightInput
              value={formData.highlights}
              onChange={(highlights) => setFormData({ ...formData, highlights })}
              disabled={isSubmitting || isViewer}
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.section}>
          <h2 className={carCategoryFormStyles.sectionTitle}>图片资源</h2>
          <FormField label="车型主图" required error={errors.image}>
            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              tenantId={currentTenant!.id}
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="内饰图片">
            <MultiImageUpload
              values={formData.interiorImages}
              onChange={(urls) => setFormData({ ...formData, interiorImages: urls })}
              tenantId={currentTenant!.id}
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="外观图片">
            <MultiImageUpload
              values={formData.exteriorImages}
              onChange={(urls) => setFormData({ ...formData, exteriorImages: urls })}
              tenantId={currentTenant!.id}
              disabled={isSubmitting || isViewer}
            />
          </FormField>

          <FormField label="车主权益图片">
            <MultiImageUpload
              values={formData.offerPictures}
              onChange={(urls) => setFormData({ ...formData, offerPictures: urls })}
              tenantId={currentTenant!.id}
              disabled={isSubmitting || isViewer}
            />
          </FormField>
        </div>

        <div className={carCategoryFormStyles.actions}>
          <button
            type="button"
            onClick={handleBack}
            className={carCategoryFormStyles.cancelButton}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className={carCategoryFormStyles.submitButton}
            disabled={isSubmitting || isViewer}
          >
            {isSubmitting ? '保存中...' : isEdit ? '更新车型' : '创建车型'}
          </button>
        </div>
      </form>
    </div>
  );
}; 
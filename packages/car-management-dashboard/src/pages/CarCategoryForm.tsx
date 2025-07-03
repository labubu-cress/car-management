import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { carCategoryFormStyles } from './CarCategoryForm.css';
import { CarCategoryFormUI } from './CarCategoryFormUI';
import { useCarCategoryForm } from './useCarCategoryForm';

export const CarCategoryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    isEdit,
    formData,
    setFormData,
    errors,
    scenarios,
    isLoading,
    isSubmitting,
    handleSubmit,
    handleBack,
    currentTenant,
    isViewer,
  } = useCarCategoryForm(id);

  if (!currentTenant) {
    return <div>加载租户信息...</div>;
  }

  if (isViewer && !isEdit) {
    return null;
  }

  if (scenarios.length === 0 && !isLoading) {
    return (
      <div className={carCategoryFormStyles.container}>
        <div className={carCategoryFormStyles.emptyState}>
          <h2>还没有车辆分类</h2>
          <p>创建车型前，请先创建车辆分类</p>
          <button
            onClick={() => navigate('/vehicle-scenarios')}
            className={carCategoryFormStyles.createButton}
          >
            去创建车辆分类
          </button>
        </div>
      </div>
    );
  }

  if (isEdit && isLoading) {
    return <div className={carCategoryFormStyles.loading}>加载中...</div>;
  }

  return (
    <CarCategoryFormUI
      isEdit={isEdit}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      scenarios={scenarios}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      handleBack={handleBack}
      currentTenant={currentTenant}
      isViewer={isViewer}
    />
  );
}; 
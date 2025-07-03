import React from 'react';
import { useNavigate } from 'react-router-dom';
import { carTrimFormStyles } from './CarTrimForm.css';
import { CarTrimFormUI } from './CarTrimFormUI';
import { useCarTrimForm } from './useCarTrimForm';

export const CarTrimForm: React.FC = () => {
  const navigate = useNavigate();
  const form = useCarTrimForm();
  
  const { 
    isEdit, 
    isViewer, 
    currentTenant, 
    categories, 
    isFetchingDetails 
  } = form;

  if (!currentTenant) {
    return <div>加载租户信息...</div>;
  }

  if (isViewer && !isEdit) {
    return null;
  }

  if (categories.length === 0) {
    return (
      <div className={carTrimFormStyles.container}>
        <div className={carTrimFormStyles.emptyState}>
          <h2>还没有车型</h2>
          <p>创建车型参数前，请先创建车型</p>
          <button
            onClick={() => navigate('/car-categories')}
            className={carTrimFormStyles.createCategoryButton}
          >
            去创建车型
          </button>
        </div>
      </div>
    );
  }

  if (isEdit && isFetchingDetails) {
    return <div className={carTrimFormStyles.loading}>加载中...</div>;
  }

  return <CarTrimFormUI {...form} />;
}; 
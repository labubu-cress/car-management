import { homepageConfigApi } from '@/lib/api';
import { type UpdateHomepageConfigInput } from '@/types/api';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormField } from '../components/FormField';
import { ImageUpload } from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { homepageConfigStyles } from './HomepageConfig.css';

const HomepageConfigPage = () => {
  const { currentTenant } = useAuth();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset, control, formState: { isSubmitting, errors } } = useForm<UpdateHomepageConfigInput>();

  useEffect(() => {
    if (currentTenant) {
      setLoading(true);
      homepageConfigApi.get().then((data) => {
        reset(data);
        setLoading(false);
      }).catch(error => {
        console.error("Failed to fetch homepage config", error);
        setLoading(false);
      });
    }
  }, [reset, currentTenant]);

  const onSubmit = async (data: UpdateHomepageConfigInput) => {
    try {
      await homepageConfigApi.update(data);
      alert('小程序首页配置已更新!');
    } catch (error) {
      console.error(error);
      alert('更新失败，请稍后再试');
    }
  };

  if (loading || !currentTenant) {
    return <div>加载中...</div>;
  }

  return (
    <div className={homepageConfigStyles.container}>
      <header className={homepageConfigStyles.header}>
        <h1 className={homepageConfigStyles.title}>小程序首页配置</h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className={homepageConfigStyles.form}>
        <FormField label="欢迎标题" error={errors.welcomeTitle?.message}>
          <input type="text" {...register('welcomeTitle')} />
        </FormField>
        <FormField label="欢迎描述" error={errors.welcomeDescription?.message}>
          <textarea {...register('welcomeDescription')} />
        </FormField>
        
        <FormField label="主 Banner 图" error={errors.bannerImage?.message}>
            <Controller
                name="bannerImage"
                control={control}
                rules={{ required: '主 Banner 图不能为空' }}
                render={({ field }) => (
                    <ImageUpload
                        value={field.value ?? null}
                        onChange={field.onChange}
                        tenantId={currentTenant.id}
                    />
                )}
            />
        </FormField>

        <FormField label="权益图" error={errors.benefitsImage?.message}>
            <Controller
                name="benefitsImage"
                control={control}
                rules={{ required: '权益图不能为空' }}
                render={({ field }) => (
                    <ImageUpload
                        value={field.value ?? null}
                        onChange={field.onChange}
                        tenantId={currentTenant.id}
                    />
                )}
            />
        </FormField>

        <div className={homepageConfigStyles.actions}>
          <button type="submit" disabled={isSubmitting} className={homepageConfigStyles.submitButton}>
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomepageConfigPage;

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
  const [isNewConfig, setIsNewConfig] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<UpdateHomepageConfigInput>();

  useEffect(() => {
    if (currentTenant) {
      setLoading(true);
      homepageConfigApi
        .get(currentTenant.id)
        .then((data) => {
          if (data) {
            reset(data);
            setIsNewConfig(false);
          } else {
            setIsNewConfig(true);
            reset({
              welcomeTitle: "",
              welcomeDescription: "",
              bannerImage: "",
              benefitsImage: "",
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to fetch homepage config", error);
          setLoading(false);
        });
    }
  }, [reset, currentTenant]);

  const onSubmit = async (data: UpdateHomepageConfigInput) => {
    try {
      if (!currentTenant) {
        throw new Error("No tenant selected");
      }
      await homepageConfigApi.update(currentTenant.id, data);
      alert('小程序首页配置已更新!');
      setIsNewConfig(false);
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
      {isNewConfig && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            border: "1px solid #e2e8f0",
            borderRadius: "0.375rem",
            backgroundColor: "#f8f9fa",
          }}
        >
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
            尚未创建小程序首页配置
          </h2>
          <p style={{ marginTop: "0.5rem" }}>
            请填写以下信息来完成首页配置。
          </p>
        </div>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={homepageConfigStyles.form}
      >
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
            rules={{ required: "主 Banner 图不能为空" }}
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
            rules={{ required: "权益图不能为空" }}
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
          <button
            type="submit"
            disabled={isSubmitting}
            className={homepageConfigStyles.submitButton}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomepageConfigPage;

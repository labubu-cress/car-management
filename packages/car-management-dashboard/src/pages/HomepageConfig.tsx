import { EmptyState } from '@/components/EmptyState';
import { homepageConfigApi } from '@/lib/api';
import { type UpdateHomepageConfigInput } from '@/types/api';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { FormField } from '../components/FormField';
import { ImageUpload } from '../components/ImageUpload';
import { useAuth } from '../contexts/AuthContext';
import { homepageConfigStyles } from './HomepageConfig.css';

const HomepageConfigPage = () => {
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: config,
    isLoading,
    error,
  } = useQuery(
    ['homepage-config', currentTenant?.id],
    () => (currentTenant ? homepageConfigApi.get(currentTenant.id) : null),
    {
      enabled: !!currentTenant,
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = useForm<UpdateHomepageConfigInput>();

  useEffect(() => {
    if (config) {
      reset(config);
    } else {
      reset({
        firstTitle: '',
        firstTitleIcon: '',
        secondTitle: '',
        secondTitleIcon: '',
        bannerImage: '',
        benefitsImage: '',
      });
    }
  }, [config, reset]);

  const updateMutation = useMutation(
    (data: UpdateHomepageConfigInput) =>
      homepageConfigApi.update(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('小程序首页配置已更新!');
        queryClient.invalidateQueries(['homepage-config', currentTenant?.id]);
        setIsCreating(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新失败，请稍后再试');
      },
    }
  );

  const onSubmit = (data: UpdateHomepageConfigInput) => {
    if (!currentTenant) {
      toast.error('No tenant selected');
      return;
    }
    updateMutation.mutate(data);
  };

  if (isLoading || !currentTenant) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>加载配置失败，请稍后重试</div>;
  }

  if (!config && !isCreating) {
    return (
      <EmptyState
        title="尚未创建小程序首页配置"
        description="请填写以下信息来完成首页配置。"
        actionLabel="开始创建"
        onAction={() => setIsCreating(true)}
        icon={<FontAwesomeIcon icon={faFileAlt} />}
      />
    );
  }

  return (
    <div className={homepageConfigStyles.container}>
      <header className={homepageConfigStyles.header}>
        <h1 className={homepageConfigStyles.title}>小程序首页配置</h1>
        {isCreating && (
          <button onClick={() => setIsCreating(false)} className={homepageConfigStyles.cancelButton}>
            取消创建
          </button>
        )}
      </header>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={homepageConfigStyles.form}
      >
        <FormField label="第一行标题" error={errors.firstTitle?.message}>
          <input type="text" {...register('firstTitle', { required: '第一行标题不能为空' })} />
        </FormField>
        <FormField label="第一行标题图标" error={errors.firstTitleIcon?.message}>
          <Controller
            name="firstTitleIcon"
            control={control}
            rules={{ required: '第一行标题图标不能为空' }}
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                tenantId={currentTenant.id}
              />
            )}
          />
        </FormField>
        <FormField label="第二行标题" error={errors.secondTitle?.message}>
          <input type="text" {...register('secondTitle', { required: '第二行标题不能为空' })} />
        </FormField>
        <FormField label="第二行标题图标" error={errors.secondTitleIcon?.message}>
          <Controller
            name="secondTitleIcon"
            control={control}
            rules={{ required: '第二行标题图标不能为空' }}
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                tenantId={currentTenant.id}
              />
            )}
          />
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

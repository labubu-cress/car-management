import { EmptyState } from '@/components/EmptyState';
import { contactUsConfigApi } from '@/lib/api';
import { type UpdateContactUsConfigInput } from '@/types/api';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { FormField } from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';
import { contactUsConfigStyles } from './ContactUsConfig.css';

const ContactUsConfigPage = () => {
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: config,
    isLoading,
    error,
  } = useQuery(
    ['contact-us-config', currentTenant?.id],
    () => (currentTenant ? contactUsConfigApi.get(currentTenant.id) : null),
    {
      enabled: !!currentTenant,
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<UpdateContactUsConfigInput>();

  useEffect(() => {
    if (config) {
      reset(config);
    } else {
      reset({
        phoneConsultationDescription: '',
        phoneNumber: '',
        emailContactDescription: '',
        contactEmail: '',
      });
    }
  }, [config, reset]);

  const updateMutation = useMutation(
    (data: UpdateContactUsConfigInput) =>
      contactUsConfigApi.update(currentTenant!.id, data),
    {
      onSuccess: () => {
        toast.success('"联系我们"页面配置已更新!');
        queryClient.invalidateQueries(['contact-us-config', currentTenant?.id]);
        setIsCreating(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || '更新失败，请稍后再试');
      },
    }
  );

  const onSubmit = (data: UpdateContactUsConfigInput) => {
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
        title="尚未创建“联系我们”页面配置"
        description="请填写以下信息来完成“联系我们”页面配置。"
        actionLabel="开始创建"
        onAction={() => setIsCreating(true)}
        icon={<FontAwesomeIcon icon={faPhone} />}
      />
    );
  }

  return (
    <div className={contactUsConfigStyles.container}>
      <header className={contactUsConfigStyles.header}>
        <h1 className={contactUsConfigStyles.title}>“联系我们”页面配置</h1>
        {isCreating && (
          <button onClick={() => setIsCreating(false)} className={contactUsConfigStyles.cancelButton}>
            取消创建
          </button>
        )}
      </header>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={contactUsConfigStyles.form}
      >
        <FormField label="电话咨询描述" error={errors.phoneConsultationDescription?.message}>
          <input type="text" {...register('phoneConsultationDescription')} />
        </FormField>
        <FormField label="电话咨询号码" error={errors.phoneNumber?.message}>
          <input type="text" {...register('phoneNumber')} />
        </FormField>
        <FormField label="邮件联系描述" error={errors.emailContactDescription?.message}>
          <input type="text" {...register('emailContactDescription')} />
        </FormField>
        <FormField label="联系邮箱" error={errors.contactEmail?.message}>
          <input type="text" {...register('contactEmail')} />
        </FormField>

        <div className={contactUsConfigStyles.actions}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={contactUsConfigStyles.submitButton}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactUsConfigPage; 
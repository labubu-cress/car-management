import { EmptyState } from '@/components/EmptyState';
import { contactUsConfigApi } from '@/lib/api';
import { type UpdateContactUsConfigInput } from '@/types/api';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { FormField } from '../components/FormField';
import { useAuth } from '../contexts/AuthContext';
import { contactUsConfigStyles } from './ContactUsConfig.css';

const days = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 0 },
];

const ContactUsConfigPage = () => {
  const { currentTenant, isViewer } = useAuth();
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
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<UpdateContactUsConfigInput>({
    defaultValues: {
      workdays: [],
    },
  });

  const workStartTime = watch('workStartTime');

  useEffect(() => {
    if (config) {
      reset({
        ...config,
        workdays: config.workdays || [],
        workStartTime: config.workStartTime,
        workEndTime: config.workEndTime,
      });
    } else {
      reset({
        contactPhoneDescription: '',
        contactPhoneNumber: '',
        contactEmailDescription: '',
        contactEmail: '',
        workdays: [],
        workStartTime: null,
        workEndTime: null,
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
    if (isViewer) {
      toast.error('您没有权限执行此操作');
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
        title='尚未创建"联系我们"页面配置'
        description='请填写以下信息来完成"联系我们"页面配置。'
        {...(!isViewer && { actionLabel: "开始创建", onAction: () => setIsCreating(true) })}
        icon={<FontAwesomeIcon icon={faPhone} />}
      />
    );
  }

  return (
    <div className={contactUsConfigStyles.container}>
      <header className={contactUsConfigStyles.header}>
        <h1 className={contactUsConfigStyles.title}>"联系我们"页面配置</h1>
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
        <fieldset disabled={isViewer}>
          <FormField label="电话咨询描述" error={errors.contactPhoneDescription?.message}>
            <input type="text" {...register('contactPhoneDescription')} />
          </FormField>
          <FormField label="电话咨询号码" error={errors.contactPhoneNumber?.message}>
            <input type="text" {...register('contactPhoneNumber')} />
          </FormField>
          <FormField label="邮件联系描述" error={errors.contactEmailDescription?.message}>
            <input type="text" {...register('contactEmailDescription')} />
          </FormField>
          <FormField label="联系邮箱" error={errors.contactEmail?.message}>
            <input type="text" {...register('contactEmail')} />
          </FormField>

          <FormField label="工作日" error={errors.workdays?.message}>
            <Controller
              name="workdays"
              control={control}
              render={({ field }) => (
                <div className={contactUsConfigStyles.workdaysContainer}>
                  {days.map((day) => (
                    <div key={day.value} className={contactUsConfigStyles.workdayItem}>
                      <input
                        type="checkbox"
                        id={`day-${day.value}`}
                        checked={field.value?.includes(day.value)}
                        onChange={(e) => {
                          const selectedDays = field.value ? [...field.value] : [];
                          if (e.target.checked) {
                            selectedDays.push(day.value);
                          } else {
                            const index = selectedDays.indexOf(day.value);
                            if (index > -1) {
                              selectedDays.splice(index, 1);
                            }
                          }
                          field.onChange(selectedDays);
                        }}
                      />
                      <label
                        htmlFor={`day-${day.value}`}
                        className={contactUsConfigStyles.workdayLabel}
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            />
          </FormField>

          <FormField label="工作时间" error={errors.workStartTime?.message || errors.workEndTime?.message}>
            <div className={contactUsConfigStyles.timeContainer}>
              <select
                {...register('workStartTime', {
                  setValueAs: (v) => (v === '' ? null : Number(v)),
                })}
              >
                <option value="">开始时间</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}:00
                  </option>
                ))}
              </select>
              <span>-</span>
              <select
                {...register('workEndTime', {
                  setValueAs: (v) => (v === '' ? null : Number(v)),
                  validate: (value) => {
                    if (value == null || workStartTime == null) return true;
                    return (
                      value > workStartTime || '结束时间必须晚于开始时间'
                    );
                  },
                })}
              >
                <option value="">结束时间</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}:00
                  </option>
                ))}
              </select>
            </div>
          </FormField>
        </fieldset>
        <div className={contactUsConfigStyles.actions}>
          <button
            type="submit"
            disabled={isSubmitting || isViewer}
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
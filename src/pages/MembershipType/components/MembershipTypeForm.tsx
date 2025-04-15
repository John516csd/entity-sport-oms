import { MembershipType, MembershipTypeFormData } from '@/services/membershipType';
import { ModalForm, ProFormDigit, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { useEffect } from 'react';

export type MembershipTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: MembershipTypeFormData) => Promise<void>;
  initialValues?: MembershipType;
  title: string;
};

const MembershipTypeForm: React.FC<MembershipTypeFormProps> = ({
  open,
  onOpenChange,
  onFinish,
  initialValues,
  title,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        try {
          await onFinish(values as MembershipTypeFormData);
          message.success('操作成功');
          return true;
        } catch (error) {
          console.error('提交表单失败:', error);
          return false;
        }
      }}
    >
      <ProFormText name="id" hidden />
      <ProFormText
        name="name"
        label="名称"
        placeholder="请输入会员卡名称"
        rules={[{ required: true, message: '请输入会员卡名称' }]}
      />
      <ProFormDigit
        name="total_sessions"
        label="总课时数"
        placeholder="请输入总课时数"
        min={0}
        rules={[{ required: true, message: '请输入总课时数' }]}
      />
      <ProFormDigit
        name="validity_days"
        label="有效天数"
        placeholder="请输入有效天数"
        min={1}
        rules={[{ required: true, message: '请输入有效天数' }]}
      />
      <ProFormDigit
        name="max_leave_count"
        label="最大请假次数"
        placeholder="请输入最大请假次数"
        min={0}
        rules={[{ required: true, message: '请输入最大请假次数' }]}
      />
      <ProFormDigit
        name="max_leave_duration"
        label="最大请假时长(天)"
        placeholder="请输入最大请假时长"
        min={0}
        rules={[{ required: true, message: '请输入最大请假时长' }]}
      />
    </ModalForm>
  );
};

export default MembershipTypeForm;

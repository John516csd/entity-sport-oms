import { Coach, CoachFormData } from '@/services/coach';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { useEffect } from 'react';

export type CoachFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: CoachFormData) => Promise<void>;
  initialValues?: Coach;
  title: string;
};

const CoachForm: React.FC<CoachFormProps> = ({
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
          await onFinish(values as CoachFormData);
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
        label="姓名"
        placeholder="请输入教练姓名"
        rules={[{ required: true, message: '请输入教练姓名' }]}
      />
      <ProFormText
        name="phone"
        label="手机号"
        placeholder="请输入手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号格式',
          },
        ]}
      />
      <ProFormTextArea
        name="specialty"
        label="专长"
        placeholder="请输入教练专长"
        rules={[{ required: true, message: '请输入教练专长' }]}
      />
    </ModalForm>
  );
};

export default CoachForm;

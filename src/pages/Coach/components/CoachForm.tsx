import { Coach, CoachFormData } from '@/services/coach';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, message, Avatar, Upload, Button } from 'antd';
import { LoadingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

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
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<UploadFile | null>(null);

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
      // 如果有头像URL，设置预览
      if (initialValues.avatar_url) {
        setAvatarFile({
          uid: '-1',
          name: 'avatar.jpg',
          status: 'done',
          url: `https://www.anteti.cn${initialValues.avatar_url}`,
        });
      } else {
        setAvatarFile(null);
      }
    } else {
      form.resetFields();
      setAvatarFile(null);
    }
  }, [open, initialValues, form]);

  // 处理头像上传前的验证
  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于2MB!');
      return false;
    }
    return true;
  };

  // 处理头像更改
  const handleAvatarChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setAvatarLoading(false);
      setAvatarFile(info.file);
      // 将文件对象设置到表单
      form.setFieldValue('avatar_image', info.file.originFileObj);
    }
  };

  // 移除头像
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    form.setFieldValue('avatar_image', undefined);
  };

  // 上传按钮
  const uploadButton = (
    <div>
      {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );

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
          // 添加文件对象到提交数据
          const data = { ...values };
          // 确保数据类型正确
          if (avatarFile?.originFileObj) {
            data.avatar_image = avatarFile.originFileObj;
          }
          await onFinish(data as CoachFormData);
          message.success('操作成功');
          return true;
        } catch (error) {
          console.error('提交表单失败:', error);
          return false;
        }
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleAvatarChange}
          customRequest={({ onSuccess }) => {
            setTimeout(() => {
              onSuccess?.('ok');
            }, 0);
          }}
        >
          {avatarFile ? (
            <div style={{ position: 'relative' }}>
              <Avatar
                src={avatarFile.url || URL.createObjectURL(avatarFile.originFileObj as Blob)}
                size={100}
                style={{
                  border: '1px solid #eee',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              />
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                style={{
                  position: 'absolute',
                  right: -10,
                  top: -10,
                  borderRadius: '50%',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAvatar();
                }}
              />
            </div>
          ) : (
            uploadButton
          )}
        </Upload>
      </div>
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

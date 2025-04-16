import { createContract } from '@/services/contracts';
import { UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Form, Input, message, Space, Upload } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import React, { useState } from 'react';

const { TextArea } = Input;

const ContractCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Function to create preview URL
  const createPreviewUrl = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Handle image upload
  const handleUpload: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      try {
        // Get the uploaded file
        const file = info.file.originFileObj as RcFile;
        // Save the file object for later use
        setContractFile(file);
        // Create preview URL
        const preview = await createPreviewUrl(file);
        setPreviewUrl(preview);
      } catch (error) {
        console.error('Error processing image:', error);
        message.error('图片处理失败');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (!contractFile) {
      message.error('请上传合同图片');
      return;
    }

    try {
      setLoading(true);

      // 创建FormData，只包含文件
      const formData = new FormData();
      formData.append('contract_image', contractFile);

      // 将其他参数作为query参数添加到URL
      const queryParams = {
        uid: values.uid,
        title: values.title,
        description: values.description,
      };

      const response = await createContract(formData, queryParams);
      if (response.code === 200) {
        message.success('合同创建成功');
        history.push('/admin/contracts');
      } else {
        message.error(response.message || '合同创建失败');
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
      message.error('合同创建失败');
    } finally {
      setLoading(false);
    }
  };

  // Custom image upload button
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <PageContainer title="创建合同">
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ title: '', description: '', uid: '' }}
        >
          <Form.Item
            label="用户ID"
            name="uid"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>

          <Form.Item
            label="合同标题"
            name="title"
            rules={[{ required: true, message: '请输入合同标题' }]}
          >
            <Input placeholder="请输入合同标题" />
          </Form.Item>

          <Form.Item
            label="合同描述"
            name="description"
            rules={[{ required: true, message: '请输入合同描述' }]}
          >
            <TextArea rows={4} placeholder="请输入合同描述" />
          </Form.Item>

          <Form.Item label="合同图片" required>
            <Upload
              name="contract_image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('只能上传图片文件!');
                }
                return isImage;
              }}
              onChange={handleUpload}
              customRequest={({ onSuccess }) => {
                // Mock a successful upload
                setTimeout(() => {
                  onSuccess?.('ok');
                }, 0);
              }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="合同" style={{ width: '100%' }} />
              ) : (
                uploadButton
              )}
            </Upload>
            <div style={{ marginTop: 8 }}>请上传清晰的合同图片，格式支持 JPG, PNG, JPEG</div>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                创建合同
              </Button>
              <Button onClick={() => history.push('/admin/contracts')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default ContractCreate;

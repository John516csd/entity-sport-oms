import { Contract, deleteContract, getContract } from '@/services/contracts';
import { ArrowLeftOutlined, DeleteOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Image,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';

const { Title, Paragraph } = Typography;
const { confirm } = Modal;

const ContractDetail: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<Contract | null>(null);

  const { loading } = useRequest(
    async () => {
      if (!contractId) return null;
      const response = await getContract(contractId);
      return response;
    },
    {
      onSuccess: (result) => {
        if (result?.code === 200 && result.data) {
          setContract(result.data);
        } else {
          message.error('获取合同详情失败');
        }
      },
      onError: (error) => {
        console.error('Failed to fetch contract details:', error);
        message.error('获取合同详情失败');
      },
    },
  );

  // 删除合同请求
  const { loading: deleteLoading, run: runDeleteContract } = useRequest(
    async (id: string | number) => {
      return await deleteContract(id);
    },
    {
      manual: true,
      onSuccess: (result) => {
        if (result.code === 200) {
          message.success('合同删除成功');
          history.push('/admin/contracts');
        } else {
          message.error(result.message || '合同删除失败');
        }
      },
      onError: (error) => {
        console.error('Failed to delete contract:', error);
        message.error('合同删除失败');
      },
    },
  );

  const handleBack = () => {
    history.push('/admin/contracts');
  };

  // 处理删除合同
  const handleDeleteContract = () => {
    if (!contract || !contractId) return;

    confirm({
      title: '确认删除',
      content: `确定要删除合同 "${contract.title}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        runDeleteContract(contract.id);
      },
    });
  };

  // 格式化图片URL
  const formatImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) {
      return path;
    }
    return `http://47.106.81.130${path}`;
  };

  if (loading || deleteLoading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!contract) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Title level={4}>未找到合同信息</Title>
            <Button type="primary" onClick={handleBack}>
              返回列表
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="合同详情"
      backIcon={<ArrowLeftOutlined />}
      onBack={handleBack}
      tags={[
        <Tag color="blue" key="id">
          ID: {contract.id}
        </Tag>,
        <Tag color={contract.status === 'active' ? 'green' : 'red'} key="status">
          {contract.status === 'active' ? '已激活' : '未激活'}
        </Tag>,
      ]}
      extra={[
        <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDeleteContract}>
          删除合同
        </Button>,
      ]}
    >
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={2}>{contract.title}</Title>
            {contract.user && (
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{contract.user.name}</span>
                <Tag icon={<PhoneOutlined />}>{contract.user.phone}</Tag>
              </Space>
            )}
          </div>

          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="合同ID">{contract.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {contract.user ? contract.user.uid : contract.uid || '未知'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={contract.status === 'active' ? 'green' : 'red'}>
                {contract.status === 'active' ? '已激活' : '未激活'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(contract.created_at).toLocaleString()}
            </Descriptions.Item>
            {contract.updated_at && (
              <Descriptions.Item label="更新时间">
                {new Date(contract.updated_at).toLocaleString()}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建者ID">{contract.created_by}</Descriptions.Item>
            {contract.user && (
              <>
                <Descriptions.Item label="用户姓名">{contract.user.name}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{contract.user.phone}</Descriptions.Item>
              </>
            )}
          </Descriptions>

          <Divider />

          <div>
            <Title level={4}>合同描述</Title>
            <Paragraph>{contract.description}</Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>合同图片</Title>
            <div style={{ textAlign: 'center' }}>
              <Image
                src={formatImageUrl(contract.contract_image)}
                alt="合同图片"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </div>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space>
              <Button type="primary" onClick={handleBack}>
                返回列表
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDeleteContract}>
                删除合同
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default ContractDetail;

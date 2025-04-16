import { Contract, deleteContract, getAllContracts, getUserContracts } from '@/services/contracts';
import { DeleteOutlined, EyeOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Image,
  Input,
  List,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

const { Paragraph, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;

const Contracts: React.FC = () => {
  const [uid, setUid] = useState<string>('');
  const [searchedUid, setSearchedUid] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 请求获取所有合同
  const {
    data: allContractsData,
    loading: allContractsLoading,
    run: fetchAllContracts,
  } = useRequest(
    async (page = 1, limit = 10) => {
      const response = await getAllContracts({ page, limit });
      return response;
    },
    {
      manual: true,
      onError: (error) => {
        console.error('Failed to fetch all contracts:', error);
        message.error('获取所有合同列表失败');
      },
    },
  );

  // 请求获取特定用户的合同
  const {
    data: userContractsData,
    loading: userContractsLoading,
    run: fetchUserContracts,
  } = useRequest(
    async (userId: string, page = 1, limit = 10) => {
      if (!userId) return { data: { contracts: [], total: 0 } };
      const response = await getUserContracts(userId, { page, limit });
      return response;
    },
    {
      manual: true,
      onError: (error) => {
        console.error('Failed to fetch user contracts:', error);
        message.error('获取用户合同列表失败');
      },
    },
  );

  // 删除合同请求
  const { loading: deleteLoading, run: runDeleteContract } = useRequest(
    async (contractId: string | number) => {
      return await deleteContract(contractId);
    },
    {
      manual: true,
      onSuccess: (result) => {
        if (result.code === 200) {
          message.success('合同删除成功');
          // 刷新合同列表
          if (searchedUid) {
            fetchUserContracts(searchedUid, currentPage);
          } else {
            fetchAllContracts(currentPage);
          }
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

  // 初始化加载所有合同
  useEffect(() => {
    fetchAllContracts(currentPage);
  }, [currentPage]);

  const loading = allContractsLoading || userContractsLoading || deleteLoading;

  // 根据是否搜索特定用户决定显示哪些合同
  const contractsData = searchedUid
    ? userContractsData?.data || { contracts: [], total: 0 }
    : allContractsData?.data || { contracts: [], total: 0 };

  const contracts = contractsData.contracts || [];
  const total = contractsData.total || 0;

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setSearchedUid('');
      fetchAllContracts(1);
      setCurrentPage(1);
      return;
    }
    setSearchedUid(value);
    fetchUserContracts(value, 1);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setUid('');
    setSearchedUid('');
    fetchAllContracts(1);
    setCurrentPage(1);
  };

  const handleCreateContract = () => {
    history.push('/admin/contracts/create');
  };

  const handleViewContract = (contractId: string | number) => {
    history.push(`/admin/contracts/detail/${contractId}`);
  };

  // 处理删除合同
  const handleDeleteContract = (contractId: string | number, contractTitle: string) => {
    confirm({
      title: '确认删除',
      content: `确定要删除合同 "${contractTitle}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        runDeleteContract(contractId);
      },
    });
  };

  // 格式化合同卡片图片地址
  const formatImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('data:')) {
      return path;
    }
    return `http://47.106.81.130${path}`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (searchedUid) {
      fetchUserContracts(searchedUid, page);
    } else {
      fetchAllContracts(page);
    }
  };

  return (
    <PageContainer
      title="合同管理"
      subTitle={searchedUid ? `用户 ${searchedUid} 的合同` : '所有合同'}
      extra={[
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreateContract}>
          创建合同
        </Button>,
      ]}
    >
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={16}>
              <Search
                placeholder="输入用户ID查询特定用户的合同"
                enterButton="搜索"
                size="large"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                onSearch={handleSearch}
                loading={loading}
                allowClear
                onClear={handleClearSearch}
              />
            </Col>
            {searchedUid && (
              <Col xs={24} sm={8}>
                <Button onClick={handleClearSearch}>显示所有合同</Button>
              </Col>
            )}
          </Row>

          <Row>
            <Col span={24}>
              <Text type="secondary">总共 {total} 份合同</Text>
            </Col>
          </Row>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" />
            </div>
          ) : contracts.length === 0 ? (
            <Empty description={searchedUid ? '未找到该用户的合同' : '暂无合同数据'} />
          ) : (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 4,
                xxl: 4,
              }}
              dataSource={contracts}
              pagination={{
                onChange: handlePageChange,
                current: currentPage,
                pageSize: 10,
                total: total,
                showSizeChanger: false,
                showTotal: (t) => `共 ${t} 项`,
              }}
              renderItem={(item: Contract) => (
                <List.Item key={item.id}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: 180,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image
                          alt={item.title}
                          src={formatImageUrl(item.contract_image)}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          preview={{
                            src: formatImageUrl(item.contract_image),
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Button
                        key="view"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewContract(item.id)}
                      >
                        查看
                      </Button>,
                      <Button
                        key="delete"
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteContract(item.id, item.title)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={item.title}
                      avatar={item.user && <Avatar icon={<UserOutlined />} />}
                      description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                          <Space>
                            <Tag color="blue">ID: {item.id}</Tag>
                            <Tag color={item.status === 'active' ? 'green' : 'red'}>
                              {item.status === 'active' ? '已激活' : '未激活'}
                            </Tag>
                          </Space>
                          {item.user && (
                            <Space>
                              <Tag color="purple">用户: {item.user.name}</Tag>
                              <Tag color="cyan">电话: {item.user.phone}</Tag>
                            </Space>
                          )}
                          <Paragraph type="secondary" style={{ fontSize: '12px', margin: 0 }}>
                            创建时间: {new Date(item.created_at).toLocaleDateString()}
                          </Paragraph>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Space>
      </Card>
    </PageContainer>
  );
};

export default Contracts;

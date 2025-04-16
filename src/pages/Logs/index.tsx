import { getSystemLogs, SystemLog, SystemLogsParams } from '@/services/logs';
import { SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const Logs: React.FC = () => {
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SystemLogsParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { data, loading } = useRequest(
    async (params: SystemLogsParams) => {
      const skip = (pagination.current - 1) * pagination.pageSize;
      const limit = pagination.pageSize;
      const response = await getSystemLogs({ ...params, skip, limit });
      return response;
    },
    {
      defaultParams: [searchParams],
      refreshDeps: [pagination.current, pagination.pageSize, searchParams],
      onSuccess: (response) => {
        if (response.code === 200 && response.data) {
          setPagination({
            ...pagination,
            total: response.data.total,
          });
        }
      },
    },
  );

  const handleSearch = (values: any) => {
    const params: SystemLogsParams = {
      level: values.level,
      log_type: values.log_type,
      uid: values.uid ? values.uid : undefined,
      search: values.search,
    };

    if (values.dateRange && values.dateRange.length === 2) {
      params.start_date = values.dateRange[0].format('YYYY-MM-DD');
      params.end_date = values.dateRange[1].format('YYYY-MM-DD');
    }

    setSearchParams(params);
    setPagination({
      ...pagination,
      current: 1, // 重置到第一页
    });
  };

  const handleTableChange = (pag: any) => {
    setPagination({
      ...pagination,
      current: pag.current,
      pageSize: pag.pageSize,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <Badge status="success" text="信息" />;
      case 'warn':
        return <Badge status="warning" text="警告" />;
      case 'error':
        return <Badge status="error" text="错误" />;
      case 'debug':
        return <Badge status="processing" text="调试" />;
      default:
        return <Badge status="default" text={level} />;
    }
  };

  const getLogTypeTag = (type: string) => {
    const colors: Record<string, string> = {
      membership: 'blue',
      user: 'green',
      coach: 'purple',
      system: 'orange',
      appointment: 'cyan',
    };

    const typeLabels: Record<string, string> = {
      membership: '会员卡',
      user: '用户',
      coach: '教练',
      system: '系统',
      appointment: '预约',
    };

    return <Tag color={colors[type] || 'default'}>{typeLabels[type] || type}</Tag>;
  };

  const formatDetails = (details: Record<string, any>) => {
    return Object.entries(details).map(([key, value]) => (
      <div key={key}>
        <Text strong>{key}:</Text> {typeof value === 'object' ? JSON.stringify(value) : value}
      </div>
    ));
  };

  const columns: ColumnsType<SystemLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      fixed: 'left',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      width: 170,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 80,
      render: (level) => getLevelBadge(level),
    },
    {
      title: '类型',
      dataIndex: 'log_type',
      width: 100,
      render: (type) => getLogTypeTag(type),
    },
    {
      title: '消息',
      dataIndex: 'message',
      ellipsis: true,
      width: 300,
    },
    {
      title: '详情',
      dataIndex: 'details',
      ellipsis: true,
      width: 300,
      render: (details) => (
        <Tooltip
          color="#fff"
          overlayInnerStyle={{ color: 'rgba(0, 0, 0, 0.85)' }}
          title={formatDetails(details)}
        >
          <Button type="link">查看详情</Button>
        </Tooltip>
      ),
    },
    {
      title: '用户ID',
      dataIndex: 'uid',
      width: 100,
    },
  ];

  const logs = data?.data?.logs || [];

  return (
    <PageContainer>
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="日志级别" name="level">
                <Select allowClear placeholder="请选择级别">
                  <Select.Option value="info">信息</Select.Option>
                  <Select.Option value="warn">警告</Select.Option>
                  <Select.Option value="error">错误</Select.Option>
                  <Select.Option value="debug">调试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="日志类型" name="log_type">
                <Select allowClear placeholder="请选择类型">
                  <Select.Option value="membership">会员卡</Select.Option>
                  <Select.Option value="user">用户</Select.Option>
                  <Select.Option value="coach">教练</Select.Option>
                  <Select.Option value="system">系统</Select.Option>
                  <Select.Option value="appointment">预约</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="用户ID" name="uid">
                <Input placeholder="请输入用户ID" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="关键词" name="search">
                <Input placeholder="请输入关键词搜索" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item label="日期范围" name="dateRange">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item label=" " colon={false}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table<SystemLog>
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1300 }}
        />
      </Card>
    </PageContainer>
  );
};

export default Logs;

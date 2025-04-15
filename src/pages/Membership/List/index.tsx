import type { Membership } from '@/services/membership';
import {
  getMembership,
  getMemberships,
  issueMembership,
  MembershipIssueParams,
  MembershipRevokeParams,
  revokeMembership,
} from '@/services/membership';
import type { MembershipType } from '@/services/membershipType';
import { getMembershipTypes } from '@/services/membershipType';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, RequestData } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Input, message, Modal, Tag, Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import MembershipIssueForm from '../components/MembershipIssueForm';

const MembershipList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [issueFormVisible, setIssueFormVisible] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<Record<string | number, string>>({});
  const [viewingMembership, setViewingMembership] = useState<Membership | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Fetch membership types on component mount
  useEffect(() => {
    const fetchMembershipTypes = async () => {
      try {
        const response = await getMembershipTypes();
        const items = Array.isArray(response.data) ? response.data : response.data?.items || [];

        // Create a mapping of type_id to name
        const typeMap: Record<string | number, string> = {};
        items.forEach((item) => {
          typeMap[item.id] = item.name;
        });

        setMembershipTypes(typeMap);
      } catch (error) {
        console.error('Failed to fetch membership types:', error);
      }
    };

    fetchMembershipTypes();
  }, []);

  const handleIssue = () => {
    setIssueFormVisible(true);
  };

  // 定义一个简化的会员卡类型，只包含展示所需的字段
  type SimpleMembershipType = {
    id: string | number;
    name: string;
  };

  // 定义一个函数，将简化的会员卡类型转换为完整的会员卡类型
  const createFullMembershipType = (simple: SimpleMembershipType): MembershipType => {
    return {
      id: simple.id,
      name: simple.name,
      total_sessions: 0, // 默认值
      validity_days: 0, // 默认值
      max_leave_count: 0, // 默认值
      max_leave_duration: 0, // 默认值
    };
  };

  const handleRevoke = async (id: string | number, params?: MembershipRevokeParams) => {
    try {
      await revokeMembership(id, params);
      message.success('回收成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('回收失败:', error);
      message.error('回收失败');
    }
  };

  const showRevokeConfirm = (id: string | number) => {
    let reason = '';
    Modal.confirm({
      title: '回收会员卡',
      content: (
        <div>
          <p>确定要回收这张会员卡吗?</p>
          <Input
            placeholder="请输入回收原因(可选)"
            onChange={(e) => {
              reason = e.target.value;
            }}
            style={{ marginTop: 10 }}
          />
        </div>
      ),
      onOk: () => handleRevoke(id, { reason }),
      okText: '确定',
      cancelText: '取消',
    });
  };

  const handleIssueFinish = async (values: MembershipIssueParams): Promise<void> => {
    try {
      await issueMembership(values);
      message.success('赠送成功');
      actionRef.current?.reload();
      setIssueFormVisible(false);
    } catch (error) {
      console.error('赠送失败:', error);
      message.error('赠送失败');
    }
  };

  const showMembershipDetails = async (id: string | number) => {
    try {
      const response = await getMembership(id);
      if (response.code === 200 && response.data) {
        setViewingMembership(response.data);
        setViewModalVisible(true);
      } else {
        message.error('获取会员卡详情失败');
      }
    } catch (error) {
      console.error('获取会员卡详情失败:', error);
      message.error('获取会员卡详情失败');
    }
  };

  const columns: ProColumns<Membership>[] = [
    {
      title: '序号',
      valueType: 'index',
      width: 80,
      fixed: 'left',
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      ellipsis: true,
    },
    {
      title: '会员卡类型',
      dataIndex: 'type_id',
      ellipsis: true,
      render: (_, record) => {
        // First try to get from the membership_type object if it exists
        if (record.membership_type?.name) {
          return record.membership_type.name;
        }
        // Then try to get from our preloaded membership types
        return membershipTypes[record.type_id] || `会员卡类型 ${record.type_id}`;
      },
    },
    {
      title: '剩余课时',
      dataIndex: 'remaining_sessions',
    },
    {
      title: '开始日期',
      dataIndex: 'purchased_at',
      valueType: 'date',
    },
    {
      title: '结束日期',
      dataIndex: 'expired_at',
      valueType: 'date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        active: { text: '有效', status: 'Success' },
        expired: { text: '已过期', status: 'Default' },
        cancelled: { text: '已取消', status: 'Error' },
        revoked: { text: '已回收', status: 'Error' },
      },
      render: (_, record) => {
        const status = record.status;
        if (status === 'active') {
          return <Tag color="green">有效</Tag>;
        } else if (status === 'expired') {
          return <Tag color="default">已过期</Tag>;
        } else if (status === 'cancelled' || status === 'revoked') {
          return (
            <div>
              <Tag color="red">{status === 'cancelled' ? '已取消' : '已回收'}</Tag>
              {record.revoke_reason && (
                <Tooltip title={`回收原因: ${record.revoke_reason}`}>
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                </Tooltip>
              )}
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: '回收原因',
      dataIndex: 'revoke_reason',
      ellipsis: true,
      hideInTable: false,
      hideInSearch: false,
      fieldProps: {
        placeholder: '搜索回收原因',
      },
      render: (text, record) => {
        if (
          (record.status === 'cancelled' || record.status === 'revoked') &&
          record.revoke_reason
        ) {
          return record.revoke_reason;
        }
        return '-';
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => {
        const actions = [
          <a key="view" onClick={() => showMembershipDetails(record.id)} style={{ marginRight: 8 }}>
            查看
          </a>,
        ];

        if (record.status === 'active') {
          actions.push(
            <a key="revoke" style={{ color: 'red' }} onClick={() => showRevokeConfirm(record.id)}>
              回收
            </a>,
          );
        }

        return actions;
      },
    },
  ];

  return (
    <>
      <ProTable<Membership>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}) => {
          const { current, pageSize, user_id, status, revoke_reason } = params;

          const requestParams: Record<string, any> = {
            skip: ((current || 1) - 1) * (pageSize || 20),
            limit: pageSize || 20,
          };

          if (user_id) requestParams.user_id = user_id;
          if (status) requestParams.status = status;
          if (revoke_reason) requestParams.revoke_reason = revoke_reason;

          const response = await getMemberships(requestParams);

          const dataItems = Array.isArray(response.data)
            ? response.data
            : response.data?.items || [];
          const total = Array.isArray(response.data) ? dataItems.length : response.data?.total || 0;

          // Add membership type name information to each item if needed
          const processedItems = dataItems.map((item) => {
            if (!item.membership_type && membershipTypes[item.type_id]) {
              return {
                ...item,
                membership_type: createFullMembershipType({
                  id: item.type_id,
                  name: membershipTypes[item.type_id],
                }),
              } as Membership;
            }
            return item;
          });

          return {
            data: processedItems,
            success: response.code === 200,
            total: total,
            current: current || 1,
            pageSize: pageSize || 20,
          } as Partial<RequestData<Membership>>;
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          filterType: 'light',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          syncToUrl: false,
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        headerTitle="会员卡列表"
        toolBarRender={() => [
          <Button key="button" type="primary" icon={<PlusOutlined />} onClick={handleIssue}>
            赠送会员卡
          </Button>,
        ]}
      />

      <MembershipIssueForm
        open={issueFormVisible}
        onOpenChange={setIssueFormVisible}
        onFinish={handleIssueFinish}
        title="赠送会员卡"
      />

      <Modal
        title="会员卡详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {viewingMembership && (
          <div>
            <p>
              <strong>用户ID:</strong> {viewingMembership.user_id}
            </p>
            <p>
              <strong>会员卡类型:</strong>{' '}
              {viewingMembership.membership_type?.name ||
                membershipTypes[viewingMembership.type_id] ||
                `会员卡类型 ${viewingMembership.type_id}`}
            </p>
            <p>
              <strong>剩余课时:</strong> {viewingMembership.remaining_sessions}
            </p>
            <p>
              <strong>开始日期:</strong> {viewingMembership.purchased_at}
            </p>
            <p>
              <strong>结束日期:</strong> {viewingMembership.expired_at}
            </p>
            <p>
              <strong>状态:</strong>{' '}
              {viewingMembership.status === 'active'
                ? '有效'
                : viewingMembership.status === 'expired'
                ? '已过期'
                : viewingMembership.status === 'revoked'
                ? '已回收'
                : '已取消'}
            </p>
            {(viewingMembership.status === 'cancelled' || viewingMembership.status === 'revoked') &&
              viewingMembership.revoke_reason && (
                <p>
                  <strong>回收原因:</strong> {viewingMembership.revoke_reason}
                </p>
              )}
            <p>
              <strong>创建时间:</strong> {viewingMembership.created_at}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default MembershipList;

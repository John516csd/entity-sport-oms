import type { Membership } from '@/services/membership';
import {
  getMembership,
  getMemberships,
  issueMembership,
  MembershipIssueParams,
  MembershipRevokeParams,
  revokeMembership,
} from '@/services/membership';
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

  // Define a function to fetch membership types that can be reused
  const fetchMembershipTypes = async () => {
    try {
      const response = await getMembershipTypes();
      if (response.code === 200 && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data?.items || [];

        // Create a mapping of type_id to name
        const typeMap: Record<string | number, string> = {};
        items.forEach((item) => {
          if (item && item.id) {
            typeMap[item.id] = item.name || `类型 ${item.id}`;
          }
        });

        setMembershipTypes(typeMap);
      }
    } catch (error) {
      console.error('Failed to fetch membership types:', error);
      message.error('获取会员卡类型失败');
    }
  };

  // Fetch membership types on component mount
  useEffect(() => {
    fetchMembershipTypes();
  }, []); // Only run on mount

  const handleIssue = () => {
    setIssueFormVisible(true);
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
      console.log('Issuing membership with values:', values);
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
      title: '用户名',
      dataIndex: 'user_name',
      ellipsis: true,
      render: (text, record) => {
        return text || `用户 ${record.uid}`;
      },
    },
    {
      title: '手机号',
      dataIndex: 'user_phone',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '会员卡类型',
      dataIndex: 'type_id',
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        showSearch: true,
        placeholder: '请选择会员卡类型',
        filterOption: (
          input: string,
          option: { label?: string | number; value: string | number },
        ) => (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase()),
        mode: undefined, // Ensure it's a single select
      },
      request: async () => {
        // Fetch fresh membership types data when dropdown is opened
        try {
          const response = await getMembershipTypes();
          if (response.code === 200 && response.data) {
            const items = Array.isArray(response.data) ? response.data : response.data?.items || [];

            // Return options directly from the API response
            return items.map((item) => ({
              label: item.name,
              value: String(item.id), // Always convert ID to string
            }));
          }
        } catch (error) {
          console.error('Failed to fetch membership types for dropdown:', error);
        }

        // Fallback to the state if API call fails
        const options = [];
        if (membershipTypes && Object.keys(membershipTypes).length > 0) {
          for (const [id, name] of Object.entries(membershipTypes)) {
            if (id && name) {
              options.push({
                label: name,
                value: String(id), // Always convert ID to string
              });
            }
          }
        }

        return options;
      },
      render: (_, record) => {
        return record.type_name || `会员卡类型 ${record.type_id}`;
      },
    },
    {
      title: '剩余课时',
      dataIndex: 'remaining_sessions',
      valueType: 'digit',
      hideInTable: false,
      hideInSearch: true,
      fieldProps: {
        precision: 0,
      },
    },
    {
      title: '剩余课时筛选',
      dataIndex: 'remaining_sessions_range',
      valueType: 'digitRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          if (!value || !Array.isArray(value) || value.length < 2) return {};
          const [min, max] = value;
          // Only include values that are not null/undefined
          const result: Record<string, number> = {};
          if (min !== null && min !== undefined) {
            result.remaining_sessions_min = min;
          }
          if (max !== null && max !== undefined) {
            result.remaining_sessions_max = max;
          }
          return result;
        },
      },
      fieldProps: {
        precision: 0,
        placeholder: ['最小课时', '最大课时'],
      },
    },
    {
      title: '开始日期',
      dataIndex: 'purchased_at',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '开始日期范围',
      dataIndex: 'purchased_at_range',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          if (!value || !Array.isArray(value) || value.length < 2) return {};
          const [start, end] = value;
          if (!start || !end) return {};
          return {
            purchased_at_start: start,
            purchased_at_end: end,
          };
        },
      },
      fieldProps: {
        placeholder: ['开始时间', '结束时间'],
      },
    },
    {
      title: '结束日期',
      dataIndex: 'expired_at',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '结束日期范围',
      dataIndex: 'expired_at_range',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          if (!value || !Array.isArray(value) || value.length < 2) return {};
          const [start, end] = value;
          if (!start || !end) return {};
          return {
            expired_at_start: start,
            expired_at_end: end,
          };
        },
      },
      fieldProps: {
        placeholder: ['开始时间', '结束时间'],
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: '有效', status: 'Success' },
        expired: { text: '已过期', status: 'Default' },
        cancelled: { text: '已取消', status: 'Error' },
        revoked: { text: '已回收', status: 'Error' },
      },
      fieldProps: {
        options: [
          { label: '有效', value: 'active' },
          { label: '已过期', value: 'expired' },
          { label: '已取消', value: 'cancelled' },
          { label: '已回收', value: 'revoked' },
        ],
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
      hideInSearch: true,
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
        onLoad={() => {
          fetchMembershipTypes(); // Refresh membership types when table data is loaded
        }}
        request={async (params = {}) => {
          const {
            current,
            pageSize,
            uid,
            status,
            type_id,
            remaining_sessions_min,
            remaining_sessions_max,
            purchased_at_start,
            purchased_at_end,
            expired_at_start,
            expired_at_end,
          } = params;

          const requestParams: Record<string, any> = {
            skip: ((current || 1) - 1) * (pageSize || 20),
            limit: pageSize || 20,
          };

          // Safely add parameters with validation
          if (uid) requestParams.uid = uid;

          if (status && typeof status === 'string') {
            // Validate that status is one of the allowed values
            const validStatuses = ['active', 'expired', 'cancelled', 'revoked'];
            if (validStatuses.includes(status)) {
              requestParams.status = status;
            }
          }

          // Handle type_id explicitly, ensuring it's properly included in the request
          if (type_id !== undefined && type_id !== null) {
            // Ensure type_id is a string when sending to API
            requestParams.type_id = String(type_id);
            console.log('Filtering by type_id:', type_id);
          }

          if (remaining_sessions_min !== null && remaining_sessions_min !== undefined) {
            requestParams.remaining_sessions_min = Number(remaining_sessions_min);
          }

          if (remaining_sessions_max !== null && remaining_sessions_max !== undefined) {
            requestParams.remaining_sessions_max = Number(remaining_sessions_max);
          }

          if (purchased_at_start && typeof purchased_at_start === 'string') {
            requestParams.purchased_at_start = purchased_at_start;
          }

          if (purchased_at_end && typeof purchased_at_end === 'string') {
            requestParams.purchased_at_end = purchased_at_end;
          }

          if (expired_at_start && typeof expired_at_start === 'string') {
            requestParams.expired_at_start = expired_at_start;
          }

          if (expired_at_end && typeof expired_at_end === 'string') {
            requestParams.expired_at_end = expired_at_end;
          }

          try {
            console.log('Sending request with params:', requestParams);
            const response = await getMemberships(requestParams);
            console.log('API response:', response);

            const dataItems = Array.isArray(response.data)
              ? response.data
              : response.data?.items || [];
            const total = Array.isArray(response.data)
              ? dataItems.length
              : response.data?.total || 0;

            // Add membership type name information to each item if needed
            const processedItems = dataItems.map((item) => {
              // Just return the item directly since the API now provides all needed fields
              return item;
            });

            return {
              data: processedItems,
              success: response.code === 200,
              total: total,
              current: current || 1,
              pageSize: pageSize || 20,
            } as Partial<RequestData<Membership>>;
          } catch (error) {
            console.error('获取会员卡列表失败:', error);
            message.error('获取会员卡列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
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
          onValuesChange: (changedValues) => {
            console.log('Form values changed:', changedValues);
          },
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
              <strong>用户名:</strong> {viewingMembership.user_name}
            </p>
            <p>
              <strong>手机号:</strong> {viewingMembership.user_phone}
            </p>
            <p>
              <strong>会员卡类型:</strong> {viewingMembership.type_name}
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

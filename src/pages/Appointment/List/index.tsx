import { Appointment, getAppointmentList } from '@/services/appointment';
import { Coach, getCoachList } from '@/services/coach';
import { getMembershipList, Membership } from '@/services/membership';
import { getUserList, User } from '@/services/user';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { message, Space, Table, Tag, Tooltip } from 'antd';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';

const AppointmentList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [coachMap, setCoachMap] = useState<Record<number, Coach>>({});
  const [membershipMap, setMembershipMap] = useState<Record<number, Membership>>({});
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  // Fetch coaches data
  const fetchCoaches = async () => {
    try {
      const result = await getCoachList({ limit: 100 });
      if (result.code === 200 && result.data) {
        const map: Record<number, Coach> = {};
        result.data.coaches.forEach((coach) => {
          map[coach.id] = coach;
        });
        setCoachMap(map);
      }
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    }
  };

  // Fetch memberships data
  const fetchMemberships = async () => {
    try {
      const result = await getMembershipList({ limit: 100 });
      if (result.code === 200 && result.data) {
        const map: Record<number, Membership> = {};
        result.data.memberships.forEach((membership) => {
          map[membership.id] = membership;
        });
        setMembershipMap(map);
      }
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const result = await getUserList({ limit: 100 });
      if (result.code === 200 && result.data) {
        const map: Record<string, User> = {};
        result.data.items?.forEach((user) => {
          if (user.uid) {
            map[user.uid] = user;
          }
          // 同时以id作为备用键
          map[String(user.id)] = user;
        });
        setUserMap(map);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Fetch all related data on component mount
  useEffect(() => {
    fetchCoaches();
    fetchMemberships();
    fetchUsers();
  }, []);

  // Define the table columns
  const columns: ProColumns<Appointment>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
    },
    {
      title: '会员',
      dataIndex: 'membership_id',
      valueType: 'text',
      width: 120,
      render: (_, record) => {
        const membership = membershipMap[record.membership_id];
        if (!membership) return record.membership_id;

        let user;
        if (membership.uid) {
          user = userMap[membership.uid];
        }

        if (!user && membership.uid) {
          // 尝试使用会员卡uid查找
          user = userMap[membership.uid];
        }

        if (!user) return record.membership_id;

        return (
          <Tooltip title={`手机号: ${user.phone || user.mobile || '未知'}`}>{user.name}</Tooltip>
        );
      },
    },
    {
      title: '教练',
      dataIndex: 'coach_id',
      valueType: 'text',
      width: 120,
      render: (_, record) => {
        const coach = coachMap[record.coach_id];
        if (!coach) return record.coach_id;

        return <Tooltip title={`专长: ${coach.specialization}`}>{coach.name}</Tooltip>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'appointment_start',
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => (
        <span>{moment(record.appointment_start).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    {
      title: '结束时间',
      dataIndex: 'appointment_end',
      valueType: 'dateTime',
      sorter: true,
      render: (_, record) => (
        <span>{moment(record.appointment_end).format('YYYY-MM-DD HH:mm')}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        scheduled: { text: '已预约', status: 'Processing' },
        completed: { text: '已完成', status: 'Success' },
        cancelled: { text: '已取消', status: 'Error' },
      },
      render: (_, record) => {
        const statusMap = {
          scheduled: { color: 'blue', text: '已预约' },
          completed: { color: 'green', text: '已完成' },
          cancelled: { color: 'red', text: '已取消' },
        };
        const status = statusMap[record.status] || { color: 'default', text: record.status };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '取消原因',
      dataIndex: 'cancellation_note',
      valueType: 'text',
      hideInSearch: true,
      ellipsis: true,
      render: (text) => text || '-',
    },
  ];

  return (
    <PageContainer>
      <ProTable<Appointment>
        headerTitle="会员预约列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={async (params) => {
          // Convert parameters for the API request
          const { current, pageSize, ...restParams } = params;

          try {
            // Handle date range filters
            let apiParams: any = {
              skip: ((current || 1) - 1) * (pageSize || 20),
              limit: pageSize || 20,
              ...restParams,
            };

            if (params.appointment_start) {
              apiParams.start_date = moment(params.appointment_start).format('YYYY-MM-DD');
            }

            if (params.appointment_end) {
              apiParams.end_date = moment(params.appointment_end).format('YYYY-MM-DD');
            }

            const result = await getAppointmentList(apiParams);

            if (result.code === 200 && result.data) {
              return {
                data: result.data.appointments,
                success: true,
                total: result.data.total,
              };
            } else {
              message.error(result.message || '获取预约列表失败');
              return {
                data: [],
                success: false,
                total: 0,
              };
            }
          } catch (error) {
            console.error('Failed to fetch appointments:', error);
            message.error('获取预约列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
      />
    </PageContainer>
  );
};

export default AppointmentList;

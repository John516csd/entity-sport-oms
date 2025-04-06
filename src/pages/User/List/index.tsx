import { getUsers } from '@/services/user';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRef } from 'react';
import type { User } from '@/services/user';

const UserList: React.FC = () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '头像',
      dataIndex: 'avatar_url',
      valueType: 'avatar',
      hideInSearch: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      valueEnum: {
        0: { text: '未知' },
        1: { text: '男' },
        2: { text: '女' },
      },
      hideInSearch: true,
    },
    {
      title: '管理员',
      dataIndex: 'is_admin',
      valueType: 'select',
      valueEnum: {
        true: { text: '是', status: 'Success' },
        false: { text: '否', status: 'Default' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
  ];

  return (
    <ProTable<User>
      columns={columns}
      actionRef={actionRef}
      cardBordered
      request={async (params = {}) => {
        const { current, pageSize, name, phone, is_admin } = params;
        const searchTerms = [];
        if (name) searchTerms.push(name);
        if (phone) searchTerms.push(phone);

        const response = await getUsers({
          skip: ((current || 1) - 1) * (pageSize || 20),
          limit: pageSize || 20,
          search: searchTerms.length > 0 ? searchTerms.join(' ') : undefined,
        });

        let filteredData = response.data?.items || [];

        // 前端过滤管理员状态
        if (is_admin !== undefined) {
          const isAdmin = is_admin === 'true';
          filteredData = filteredData.filter((user) => user.is_admin === isAdmin);
        }

        return {
          data: filteredData,
          success: response.code === 200,
          total: filteredData.length,
          current: response.data?.page || 1,
          pageSize: response.data?.limit || 20,
        };
      }}
      rowKey="id"
      search={{
        labelWidth: 'auto',
      }}
      options={{
        setting: {
          listsHeight: 400,
        },
      }}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
      }}
      dateFormatter="string"
      headerTitle="用户列表"
    />
  );
};

export default UserList;

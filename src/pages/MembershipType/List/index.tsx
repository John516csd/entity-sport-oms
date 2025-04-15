import type { MembershipType, MembershipTypeFormData } from '@/services/membershipType';
import {
  createMembershipType,
  deleteMembershipType,
  getMembershipType,
  getMembershipTypes,
  updateMembershipType,
} from '@/services/membershipType';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import { useRef, useState } from 'react';
import MembershipTypeForm from '../components/MembershipTypeForm';

const MembershipTypeList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState(false);
  const [currentMembershipType, setCurrentMembershipType] = useState<MembershipType>();
  const [formTitle, setFormTitle] = useState('新增会员卡');

  const handleAdd = () => {
    setCurrentMembershipType(undefined);
    setFormTitle('新增会员卡');
    setFormVisible(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await getMembershipType(id);
      if (res.code === 200 && res.data) {
        setCurrentMembershipType(res.data);
        setFormTitle('编辑会员卡');
        setFormVisible(true);
      } else {
        message.error('获取会员卡详情失败');
      }
    } catch (error) {
      console.error('获取会员卡详情失败:', error);
      message.error('获取会员卡详情失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMembershipType(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleFormFinish = async (values: MembershipTypeFormData) => {
    try {
      if (values.id) {
        // 更新
        await updateMembershipType(values.id, values);
        message.success('更新成功');
      } else {
        // 创建
        await createMembershipType(values);
        message.success('创建成功');
      }
      actionRef.current?.reload();
      setFormVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const columns: ProColumns<MembershipType>[] = [
    {
      title: '序号',
      valueType: 'index',
      width: 80,
      fixed: 'left',
    },
    {
      title: '名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '总课时数',
      dataIndex: 'total_sessions',
      sorter: true,
    },
    {
      title: '有效天数',
      dataIndex: 'validity_days',
      sorter: true,
    },
    {
      title: '最大请假次数',
      dataIndex: 'max_leave_count',
      sorter: true,
    },
    {
      title: '最大请假时长(天)',
      dataIndex: 'max_leave_duration',
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a key="edit" onClick={() => handleEdit(String(record.id))}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这条记录吗?"
          onConfirm={() => handleDelete(String(record.id))}
          okText="确定"
          cancelText="取消"
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <>
      <ProTable<MembershipType>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}) => {
          const { current, pageSize, name } = params;
          const searchTerms = [];
          if (name) searchTerms.push(name);

          const response = await getMembershipTypes({
            skip: ((current || 1) - 1) * (pageSize || 20),
            limit: pageSize || 20,
            search: searchTerms.length > 0 ? searchTerms.join(' ') : undefined,
          });

          // 适配直接返回数组的情况
          const dataItems = Array.isArray(response.data)
            ? response.data
            : response.data?.items || [];
          const total = Array.isArray(response.data) ? dataItems.length : response.data?.total || 0;

          return {
            data: dataItems,
            success: response.code === 200,
            total: total,
            current: current || 1,
            pageSize: pageSize || 20,
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
        headerTitle="会员卡列表"
        toolBarRender={() => [
          <Button key="button" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建
          </Button>,
        ]}
      />

      <MembershipTypeForm
        open={formVisible}
        onOpenChange={setFormVisible}
        onFinish={handleFormFinish}
        initialValues={currentMembershipType}
        title={formTitle}
      />
    </>
  );
};

export default MembershipTypeList;

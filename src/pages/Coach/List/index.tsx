import type { Coach, CoachFormData } from '@/services/coach';
import { createCoach, deleteCoach, getCoach, getCoaches, updateCoach } from '@/services/coach';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import { useRef, useState } from 'react';
import CoachForm from '../components/CoachForm';

const CoachList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState(false);
  const [currentCoach, setCurrentCoach] = useState<Coach>();
  const [formTitle, setFormTitle] = useState('新增教练');

  const handleAdd = () => {
    setCurrentCoach(undefined);
    setFormTitle('新增教练');
    setFormVisible(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await getCoach(id);
      if (res.code === 200 && res.data) {
        setCurrentCoach(res.data);
        setFormTitle('编辑教练');
        setFormVisible(true);
      } else {
        message.error('获取教练详情失败');
      }
    } catch (error) {
      console.error('获取教练详情失败:', error);
      message.error('获取教练详情失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoach(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleFormFinish = async (values: CoachFormData) => {
    try {
      if (values.id) {
        // 更新
        await updateCoach(values.id, values);
        message.success('更新成功');
      } else {
        // 创建
        await createCoach(values);
        message.success('创建成功');
      }
      actionRef.current?.reload();
      setFormVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const columns: ProColumns<Coach>[] = [
    {
      title: '序号',
      valueType: 'index',
      width: 80,
      fixed: 'left',
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
      title: '专长',
      dataIndex: 'specialty',
      ellipsis: true,
      hideInSearch: true,
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
        <a key="edit" onClick={() => handleEdit(record.id)}>
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这条记录吗?"
          onConfirm={() => handleDelete(record.id)}
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
      <ProTable<Coach>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}) => {
          const { current, pageSize, name, phone } = params;
          const searchTerms = [];
          if (name) searchTerms.push(name);
          if (phone) searchTerms.push(phone);

          const response = await getCoaches({
            skip: ((current || 1) - 1) * (pageSize || 20),
            limit: pageSize || 20,
            search: searchTerms.length > 0 ? searchTerms.join(' ') : undefined,
          });

          return {
            data: response.data?.items || [],
            success: response.code === 200,
            total: response.data?.total || 0,
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
        headerTitle="教练列表"
        toolBarRender={() => [
          <Button key="button" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建
          </Button>,
        ]}
      />

      <CoachForm
        open={formVisible}
        onOpenChange={setFormVisible}
        onFinish={handleFormFinish}
        initialValues={currentCoach}
        title={formTitle}
      />
    </>
  );
};

export default CoachList;

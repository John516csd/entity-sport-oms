import { MembershipIssueParams } from '@/services/membership';
import { getMembershipTypes, MembershipType } from '@/services/membershipType';
import { getUserOptions, User } from '@/services/user';
import {
  ModalForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

export type MembershipIssueFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: (values: MembershipIssueParams) => Promise<void>;
  title: string;
};

const MembershipIssueForm: React.FC<MembershipIssueFormProps> = ({
  open,
  onOpenChange,
  onFinish,
  title,
}) => {
  const [form] = Form.useForm();
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);

  const fetchMembershipTypes = async () => {
    try {
      const res = await getMembershipTypes();
      if (res.code === 200 && res.data) {
        const items = Array.isArray(res.data) ? res.data : res.data.items || [];
        setMembershipTypes(items);
      }
    } catch (error) {
      console.error('获取会员卡类型失败:', error);
      message.error('获取会员卡类型失败');
    }
  };

  useEffect(() => {
    if (open) {
      fetchMembershipTypes();
      form.resetFields();
    }
  }, [open, form]);

  // 处理提交前的数据转换
  const handleFinish = async (values: any) => {
    const formattedValues = { ...values };

    // 格式化日期 (如果有)
    if (formattedValues.purchased_at && typeof formattedValues.purchased_at !== 'string') {
      formattedValues.purchased_at = dayjs(formattedValues.purchased_at).format('YYYY-MM-DD');
    }

    return onFinish(formattedValues as MembershipIssueParams);
  };

  return (
    <ModalForm
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        width: 550,
      }}
      onFinish={handleFinish}
    >
      <ProFormSelect
        name="user_id"
        label="选择用户"
        placeholder="请输入用户姓名或手机号搜索"
        showSearch
        request={async (params) => {
          try {
            const res = await getUserOptions(params.keyWords);
            if (res.code === 200 && res.data) {
              const users = Array.isArray(res.data) ? res.data : [];
              return users.map((user: User) => ({
                label: `${user.name} (${user.phone})`,
                value: user.id,
              }));
            }
            return [];
          } catch (error) {
            console.error('获取用户列表失败:', error);
            return [];
          }
        }}
        fieldProps={{
          showArrow: true,
          filterOption: false,
          notFoundContent: '未找到用户',
          style: { width: '100%' },
        }}
        rules={[{ required: true, message: '请选择用户' }]}
      />

      <ProFormDependency name={['user_id']}>
        {({ user_id }) => {
          return user_id ? (
            <div style={{ marginBottom: 24 }}>
              <p style={{ margin: 0, color: '#666' }}>
                已选择用户ID: <span style={{ fontWeight: 'bold' }}>{user_id}</span>
              </p>
            </div>
          ) : null;
        }}
      </ProFormDependency>

      <ProFormSelect
        name="type_id"
        label="会员卡类型"
        placeholder="请选择会员卡类型"
        options={membershipTypes.map((type) => ({
          label: `${type.name} (课时:${type.total_sessions}, 有效期:${type.validity_days}天)`,
          value: type.id,
        }))}
        rules={[{ required: true, message: '请选择会员卡类型' }]}
      />
      <ProFormDatePicker name="purchased_at" label="开始日期" placeholder="不填默认为今天" />
    </ModalForm>
  );
};

export default MembershipIssueForm;

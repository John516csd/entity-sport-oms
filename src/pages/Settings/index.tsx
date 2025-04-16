import { getSystemSettings, SystemSettings, updateSystemSettings } from '@/services/settings';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Card, Form, Input, InputNumber, message, Space, TimePicker } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  // 获取系统设置数据
  const { data, loading, run } = useRequest(getSystemSettings, {
    manual: false,
    onSuccess: (result) => {
      if (result.code === 200 && result.data) {
        // 设置表单初始值
        const { business_hours, ...rest } = result.data;
        form.setFieldsValue({
          ...rest,
          business_hours_start: business_hours.start ? moment(business_hours.start, 'HH:mm') : null,
          business_hours_end: business_hours.end ? moment(business_hours.end, 'HH:mm') : null,
        });
      }
    },
    onError: (error) => {
      console.error('获取系统设置失败:', error);
      message.error('获取系统设置失败');
    },
  });

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      // 处理时间格式
      const submittingData: SystemSettings = {
        system_name: values.system_name,
        business_hours: {
          start: values.business_hours_start
            ? values.business_hours_start.format('HH:mm')
            : '08:00',
          end: values.business_hours_end ? values.business_hours_end.format('HH:mm') : '22:00',
        },
        appointment_duration: values.appointment_duration,
        max_appointments_per_day: values.max_appointments_per_day,
        max_appointments_per_coach: values.max_appointments_per_coach,
        cancellation_policy: {
          hours_before: values.hours_before,
          refund_percentage: values.refund_percentage,
        },
      };

      const response = await updateSystemSettings(submittingData);
      if (response.code === 200) {
        message.success('系统设置更新成功');
        run(); // 重新加载最新数据
      } else {
        message.error('系统设置更新失败');
      }
    } catch (error) {
      console.error('更新系统设置失败:', error);
      message.error('更新系统设置失败');
    }
  };

  // 重置表单
  const handleReset = () => {
    if (data?.data) {
      const { business_hours, ...rest } = data.data;
      form.setFieldsValue({
        ...rest,
        business_hours_start: business_hours.start ? moment(business_hours.start, 'HH:mm') : null,
        business_hours_end: business_hours.end ? moment(business_hours.end, 'HH:mm') : null,
        hours_before: data.data.cancellation_policy.hours_before,
        refund_percentage: data.data.cancellation_policy.refund_percentage,
      });
    } else {
      form.resetFields();
    }
  };

  useEffect(() => {
    // 初次加载时设置默认值
    if (data?.data) {
      const { business_hours, cancellation_policy, ...rest } = data.data;
      form.setFieldsValue({
        ...rest,
        business_hours_start: business_hours.start ? moment(business_hours.start, 'HH:mm') : null,
        business_hours_end: business_hours.end ? moment(business_hours.end, 'HH:mm') : null,
        hours_before: cancellation_policy.hours_before,
        refund_percentage: cancellation_policy.refund_percentage,
      });
    }
  }, [data, form]);

  return (
    <PageContainer>
      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            system_name: '健身房管理系统',
            business_hours_start: moment('08:00', 'HH:mm'),
            business_hours_end: moment('22:00', 'HH:mm'),
            appointment_duration: 60,
            max_appointments_per_day: 8,
            max_appointments_per_coach: 2,
            hours_before: 24,
            refund_percentage: 100,
          }}
        >
          <Form.Item
            label="系统名称"
            name="system_name"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>

          <Form.Item label="营业时间">
            <Space>
              <Form.Item
                name="business_hours_start"
                noStyle
                rules={[{ required: true, message: '请选择营业开始时间' }]}
              >
                <TimePicker format="HH:mm" placeholder="开始时间" />
              </Form.Item>
              <span>至</span>
              <Form.Item
                name="business_hours_end"
                noStyle
                rules={[{ required: true, message: '请选择营业结束时间' }]}
              >
                <TimePicker format="HH:mm" placeholder="结束时间" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            label="预约时长（分钟）"
            name="appointment_duration"
            rules={[{ required: true, message: '请输入预约时长' }]}
          >
            <InputNumber min={15} max={180} step={15} />
          </Form.Item>

          <Form.Item
            label="每天最大预约数"
            name="max_appointments_per_day"
            rules={[{ required: true, message: '请输入每天最大预约数' }]}
          >
            <InputNumber min={1} max={50} />
          </Form.Item>

          <Form.Item
            label="每个教练每天最大预约数"
            name="max_appointments_per_coach"
            rules={[{ required: true, message: '请输入每个教练每天最大预约数' }]}
          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          <Form.Item label="取消政策">
            <Space align="baseline">
              <Form.Item
                name="hours_before"
                noStyle
                rules={[{ required: true, message: '请输入取消预约提前时间' }]}
              >
                <InputNumber min={1} max={72} />
              </Form.Item>
              <span>小时前取消预约，退款</span>
              <Form.Item
                name="refund_percentage"
                noStyle
                rules={[{ required: true, message: '请输入退款百分比' }]}
              >
                <InputNumber min={0} max={100} />
              </Form.Item>
              <span>%</span>
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default Settings;

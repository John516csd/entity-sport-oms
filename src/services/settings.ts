import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 系统设置信息 */
export type SystemSettings = {
  system_name: string; // 系统名称
  business_hours: {
    start: string; // 营业开始时间
    end: string; // 营业结束时间
  };
  appointment_duration: number; // 预约时长（分钟）
  max_appointments_per_day: number; // 每天最大预约数
  max_appointments_per_coach: number; // 每个教练每天最大预约数
  cancellation_policy: {
    hours_before: number; // 取消预约提前时间（小时）
    refund_percentage: number; // 退款百分比
  };
};

/** 更新系统设置参数 */
export type SystemSettingsUpdateParams = SystemSettings;

/** 获取系统设置 GET /api/admin/settings */
export async function getSystemSettings() {
  return request<BaseResponse<SystemSettings>>('/api/admin/settings', {
    method: 'GET',
  });
}

/** 更新系统设置 PUT /api/admin/settings */
export async function updateSystemSettings(data: SystemSettingsUpdateParams) {
  return request<BaseResponse<SystemSettings>>('/api/admin/settings', {
    method: 'PUT',
    data,
  });
}

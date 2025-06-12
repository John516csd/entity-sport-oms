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

/** API响应的设置数据格式 */
export type SystemSettingsResponse = {
  settings: Array<[string, any]>;
  total: number;
  skip: number;
  limit: number;
};

/** 更新系统设置参数 */
export type SystemSettingsUpdateParams = SystemSettings;

/** 将数组格式的设置转换为对象格式 */
export function transformSettingsArrayToObject(
  settingsArray: Array<[string, any]>,
): SystemSettings {
  const settingsObj: any = {};

  settingsArray.forEach(([key, value]) => {
    settingsObj[key] = value;
  });

  // 确保所有必需字段都存在，提供默认值
  return {
    system_name: settingsObj.system_name || '健身房管理系统',
    business_hours: settingsObj.business_hours || { start: '08:00', end: '22:00' },
    appointment_duration: settingsObj.appointment_duration || 60,
    max_appointments_per_day: settingsObj.max_appointments_per_day || 8,
    max_appointments_per_coach: settingsObj.max_appointments_per_coach || 2,
    cancellation_policy: settingsObj.cancellation_policy || {
      hours_before: 24,
      refund_percentage: 100,
    },
  };
}

/** 获取系统设置 GET /api/admin/settings */
export async function getSystemSettings() {
  return request<BaseResponse<SystemSettingsResponse>>('/api/admin/settings', {
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

import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 预约信息 */
export interface Appointment {
  id: number;
  uid: string;
  membership_id: number;
  coach_id: number;
  appointment_start: string;
  appointment_end: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  cancellation_note: string | null;
}

/** 预约列表查询参数 */
export interface AppointmentListParams {
  skip?: number;
  limit?: number;
  membership_id?: number;
  coach_id?: number;
  status?: 'scheduled' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
}

/** 预约列表响应结果 */
export interface AppointmentListResult {
  total: number;
  appointments: Appointment[];
}

/** 获取预约列表 GET /api/admin/appointments */
export async function getAppointmentList(
  params: AppointmentListParams,
  options?: { [key: string]: any },
) {
  return request<BaseResponse<AppointmentListResult>>('/api/admin/appointments', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 教练信息 */
export interface Coach {
  id: number;
  name: string;
  mobile: string;
  avatar: string;
  status: 'active' | 'inactive';
  specialization: string;
  created_at: string;
}

/** 教练列表查询参数 */
export interface CoachListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
}

/** 教练列表响应结果 */
export interface CoachListResult {
  total: number;
  coaches: Coach[];
}

/** 获取教练列表 GET /api/admin/coaches */
export async function getCoachList(params: CoachListParams, options?: { [key: string]: any }) {
  return request<BaseResponse<CoachListResult>>('/api/admin/coaches', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 为了向后兼容，保留原函数名
export const getCoaches = getCoachList;

/** 创建或更新教练参数 */
export type CoachFormData = {
  id?: string;
  name: string;
  phone: string;
  specialty: string;
};

/** 创建教练 POST /api/admin/coaches */
export async function createCoach(data: CoachFormData) {
  return request<BaseResponse<Coach>>('/api/admin/coaches', {
    method: 'POST',
    data,
  });
}

/** 更新教练 PUT /api/admin/coaches/:id */
export async function updateCoach(id: string, data: CoachFormData) {
  return request<BaseResponse<Coach>>(`/api/admin/coaches/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 获取教练详情 GET /api/admin/coaches/:id */
export async function getCoach(id: string) {
  return request<BaseResponse<Coach>>(`/api/admin/coaches/${id}`, {
    method: 'GET',
  });
}

/** 删除教练 DELETE /api/admin/coaches/:id */
export async function deleteCoach(id: string) {
  return request<BaseResponse<any>>(`/api/admin/coaches/${id}`, {
    method: 'DELETE',
  });
}

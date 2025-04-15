import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 教练信息 */
export type Coach = {
  id: string;
  name: string;
  phone: string;
  specialty: string; // 专长
  created_at: string;
};

/** 教练列表结果 */
export type CoachListResult = {
  items: Coach[];
  total: number;
  page: number;
  limit: number;
};

/** 教练列表参数 */
export type CoachListParams = {
  skip?: number;
  limit?: number;
  search?: string;
};

/** 创建或更新教练参数 */
export type CoachFormData = {
  id?: string;
  name: string;
  phone: string;
  specialty: string;
};

/** 获取教练列表 GET /api/admin/coaches */
export async function getCoaches(params?: CoachListParams) {
  return request<BaseResponse<CoachListResult>>('/api/admin/coaches', {
    method: 'GET',
    params: {
      skip: params?.skip || 0,
      limit: params?.limit || 20,
      search: params?.search,
    },
  });
}

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

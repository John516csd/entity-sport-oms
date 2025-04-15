import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 会员卡类型信息 */
export type MembershipType = {
  id: string | number;
  name: string;
  total_sessions: number; // 总课时数
  validity_days: number; // 有效天数
  max_leave_count: number; // 最大请假次数
  max_leave_duration: number; // 最大请假时长(天)
  created_at?: string;
};

/** 会员卡类型列表结果 */
export type MembershipTypeListResult =
  | MembershipType[]
  | {
      items: MembershipType[];
      total: number;
      page: number;
      limit: number;
    };

/** 会员卡类型列表参数 */
export type MembershipTypeListParams = {
  skip?: number;
  limit?: number;
  search?: string;
};

/** 创建或更新会员卡类型参数 */
export type MembershipTypeFormData = {
  id?: string | number;
  name: string;
  total_sessions: number;
  validity_days: number;
  max_leave_count: number;
  max_leave_duration: number;
};

/** 获取会员卡类型列表 GET /api/admin/membership-types */
export async function getMembershipTypes(params?: MembershipTypeListParams) {
  return request<BaseResponse<MembershipTypeListResult>>('/api/admin/membership-types', {
    method: 'GET',
    params: {
      skip: params?.skip || 0,
      limit: params?.limit || 20,
      search: params?.search,
    },
  });
}

/** 创建会员卡类型 POST /api/admin/membership-types */
export async function createMembershipType(data: MembershipTypeFormData) {
  return request<BaseResponse<MembershipType>>('/api/admin/membership-types', {
    method: 'POST',
    data,
  });
}

/** 更新会员卡类型 PUT /api/admin/membership-types/:id */
export async function updateMembershipType(id: string | number, data: MembershipTypeFormData) {
  return request<BaseResponse<MembershipType>>(`/api/admin/membership-types/${id}`, {
    method: 'PUT',
    data,
  });
}

/** 获取会员卡类型详情 GET /api/admin/membership-types/:id */
export async function getMembershipType(id: string | number) {
  return request<BaseResponse<MembershipType>>(`/api/admin/membership-types/${id}`, {
    method: 'GET',
  });
}

/** 删除会员卡类型 DELETE /api/admin/membership-types/:id */
export async function deleteMembershipType(id: string | number) {
  return request<BaseResponse<any>>(`/api/admin/membership-types/${id}`, {
    method: 'DELETE',
  });
}

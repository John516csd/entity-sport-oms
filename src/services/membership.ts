import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 会员卡信息 */
export interface Membership {
  id: number;
  uid: string;
  type_id: number;
  status: 'active' | 'expired' | 'cancelled' | 'revoked';
  purchased_at: string;
  expired_at: string;
  total_sessions: number;
  remaining_sessions: number;
  notes: string;
  created_at: string;
  updated_at: string;
  // 兼容性字段
  user_name?: string;
  user_phone?: string;
  type_name?: string;
  revoke_reason?: string;
}

/** 会员卡列表查询参数 */
export interface MembershipListParams {
  skip?: number;
  limit?: number;
  uid?: number;
  type_id?: number;
  status?: string;
  remaining_sessions_min?: number;
  remaining_sessions_max?: number;
  purchased_at_start?: string;
  purchased_at_end?: string;
  expired_at_start?: string;
  expired_at_end?: string;
}

/** 会员卡列表响应结果 */
export interface MembershipListResult {
  total: number;
  memberships: Membership[];
}

/** 会员卡列表结果 */
export type MembershipListResultType =
  | MembershipListResult
  | {
      items: Membership[];
      total: number;
      page: number;
      limit: number;
    };

/** 赠送会员卡参数 */
export type MembershipIssueParams = {
  uid: string | number; // 用户ID
  type_id: string | number; // 会员卡类型ID
  purchased_at?: string; // 可选的开始日期，默认当前日期 (与API保持一致)
};

/** 回收会员卡参数 */
export type MembershipRevokeParams = {
  reason?: string; // 回收原因
};

/** 获取会员卡列表 GET /api/admin/memberships */
export async function getMembershipList(
  params: MembershipListParams,
  options?: { [key: string]: any },
) {
  return request<BaseResponse<MembershipListResult>>('/api/admin/memberships', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 为了向后兼容，保留原函数名
export const getMemberships = getMembershipList;

/** 赠送会员卡 POST /api/admin/memberships */
export async function issueMembership(data: MembershipIssueParams) {
  return request<BaseResponse<Membership>>('/api/admin/memberships', {
    method: 'POST',
    data,
  });
}

/** 回收会员卡 PUT /api/admin/memberships/:id/revoke */
export async function revokeMembership(id: string | number, data?: MembershipRevokeParams) {
  return request<BaseResponse<any>>(`/api/admin/memberships/${id}/revoke`, {
    method: 'PUT',
    data,
  });
}

/** 获取会员卡详情 GET /api/admin/memberships/:id */
export async function getMembership(id: string | number) {
  return request<BaseResponse<Membership>>(`/api/admin/memberships/${id}`, {
    method: 'GET',
  });
}

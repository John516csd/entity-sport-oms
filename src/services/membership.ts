import { request } from '@umijs/max';
import type { MembershipType } from './membershipType';
import type { BaseResponse } from './typings';

/** 会员卡信息 */
export type Membership = {
  id: string | number;
  user_id: string | number; // 用户ID
  type_id: string | number; // 会员卡类型ID (API实际返回的是type_id而不是membership_type_id)
  membership_type_id?: string | number; // 兼容旧代码的字段名
  membership_type?: MembershipType; // 会员卡类型详情
  remaining_sessions: number; // 剩余课时
  purchased_at: string; // 购买日期 (API实际返回的是purchased_at而不是start_date)
  expired_at: string; // 过期日期 (API实际返回的是expired_at而不是end_date)
  start_date?: string; // 兼容旧代码的字段名
  end_date?: string; // 兼容旧代码的字段名
  status: 'active' | 'expired' | 'cancelled' | 'revoked'; // 状态：激活、过期、取消、回收
  revoke_reason?: string; // 回收原因
  created_at?: string;
};

/** 会员卡列表结果 */
export type MembershipListResult =
  | Membership[]
  | {
      items: Membership[];
      total: number;
      page: number;
      limit: number;
    };

/** 会员卡列表查询参数 */
export type MembershipListParams = {
  skip?: number;
  limit?: number;
  user_id?: string | number; // 根据用户ID查询
  status?: string; // 状态筛选
  revoke_reason?: string; // 根据回收原因查询
};

/** 赠送会员卡参数 */
export type MembershipIssueParams = {
  user_id: string | number; // 用户ID
  type_id: string | number; // 会员卡类型ID
  purchased_at?: string; // 可选的开始日期，默认当前日期 (与API保持一致)
};

/** 回收会员卡参数 */
export type MembershipRevokeParams = {
  reason?: string; // 回收原因
};

/** 获取会员卡列表 GET /api/admin/memberships */
export async function getMemberships(params?: MembershipListParams) {
  return request<BaseResponse<MembershipListResult>>('/api/admin/memberships', {
    method: 'GET',
    params,
  });
}

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

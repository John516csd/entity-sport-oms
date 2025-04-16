import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

export interface User {
  id: number;
  uid?: string;
  name: string;
  phone: string;
  email?: string;
  avatar_url?: string;
  gender?: number;
  is_admin: boolean;
  created_at: string;
  // 兼容性字段
  mobile?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
}

export interface LoginParams {
  username: string;
  password: string;
  autoLogin?: boolean;
}

export interface LoginResult {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface UserListResult {
  total: number;
  items: User[]; // API返回的是items
  users?: User[]; // 兼容性字段
  page?: number;
  limit?: number;
  pages?: number;
}

/** 获取用户列表 GET /api/admin/users */
export async function getUserList(params: UserListParams, options?: { [key: string]: any }) {
  return request<BaseResponse<UserListResult>>('/api/admin/users', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 为了向后兼容，保留原函数名
export const getUsers = getUserList;

/** 获取用户选项列表 (用于下拉选择) GET /api/admin/users/options */
export async function getUserOptions(search?: string) {
  return request<BaseResponse<UserListResult>>('/api/admin/users', {
    method: 'GET',
    params: {
      limit: 100, // 获取较多记录用于选择
      search,
    },
  });
}

/** 登录接口 POST /api/auth/login */
export async function login(body: LoginParams, options?: { [key: string]: any }) {
  return request<BaseResponse<LoginResult>>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 登出接口 POST /api/auth/logout */
export async function logout() {
  return request<BaseResponse<Record<string, any>>>('/api/auth/logout', {
    method: 'POST',
  });
}

/** 获取当前用户 GET /api/auth/currentUser */
export async function getCurrentUser(options?: { [key: string]: any }) {
  return request<BaseResponse<User>>('/api/auth/currentUser', {
    method: 'GET',
    ...(options || {}),
  });
}

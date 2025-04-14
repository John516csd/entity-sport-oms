import { request } from '@umijs/max';
import { BaseResponse } from './typings';

export interface LoginParams {
  phone: string;
  password: string;
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
}

export interface User {
  id: number;
  name: string;
  phone: string;
  gender: number;
  is_admin: boolean;
  created_at: string;
  avatar_url: string;
  unionid: string;
  openid: string;
}

export interface UserListResult {
  total: number;
  items: User[];
  page: number;
  limit: number;
  pages: number;
}

/** 登录接口 POST /api/login */
export async function login(body: LoginParams) {
  return request<BaseResponse<LoginResult>>('/api/login', {
    method: 'POST',
    data: body,
  });
}

/** 获取用户列表 GET /api/admin/users */
export async function getUsers(params?: UserListParams) {
  return request<BaseResponse<UserListResult>>('/api/admin/users', {
    method: 'GET',
    params: {
      skip: params?.skip || 0,
      limit: params?.limit || 20,
      search: params?.search,
    },
  });
}

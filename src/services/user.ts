import { request } from '@umijs/max';

export interface LoginParams {
  phone: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  is_admin: boolean;
  token_type: string;
  user_id: string;
}

export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  request_id?: string;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface User {
  id: number;
  name: string | null;
  phone: string | null;
  gender: number | null;
  is_admin: boolean;
  created_at: string;
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

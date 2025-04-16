import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 用户信息 */
export type User = {
  id: number;
  uid: string;
  name: string;
  phone: string;
};

/** 合同信息 */
export type Contract = {
  id: string | number;
  uid?: string;
  title: string;
  description: string;
  contract_image: string;
  created_at: string;
  updated_at?: string;
  created_by: number;
  status: string;
  user?: User;
};

/** 合同分页数据 */
export type ContractsResponse = {
  total: number;
  contracts: Contract[];
  page: number;
  limit: number;
  pages: number;
};

/** 创建合同参数 */
export type ContractCreateParams = {
  uid: string;
  title: string;
  description: string;
  contract_image: string;
};

/** 创建合同 POST /api/admin/contracts */
export async function createContract(
  formData: FormData,
  queryParams: {
    uid: string;
    title: string;
    description: string;
  },
) {
  return request<BaseResponse<Contract>>('/api/admin/contracts', {
    method: 'POST',
    params: queryParams,
    data: formData,
    requestType: 'form',
  });
}

/** 获取所有合同 GET /api/admin/contracts */
export async function getAllContracts(params?: { page?: number; limit?: number }) {
  return request<BaseResponse<ContractsResponse>>('/api/admin/contracts', {
    method: 'GET',
    params,
  });
}

/** 获取用户合同列表 GET /api/admin/contracts/user/:uid */
export async function getUserContracts(uid: string, params?: { page?: number; limit?: number }) {
  return request<BaseResponse<ContractsResponse>>(`/api/admin/contracts/user/${uid}`, {
    method: 'GET',
    params,
  });
}

/** 获取合同详情 GET /api/admin/contracts/:contract_id */
export async function getContract(contractId: string | number) {
  return request<BaseResponse<Contract>>(`/api/admin/contracts/${contractId}`, {
    method: 'GET',
  });
}

/** 删除合同 DELETE /api/admin/contracts/:contract_id */
export async function deleteContract(contractId: string | number) {
  return request<BaseResponse<any>>(`/api/admin/contracts/${contractId}`, {
    method: 'DELETE',
  });
}

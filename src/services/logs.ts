import { request } from '@umijs/max';
import type { BaseResponse } from './typings';

/** 系统日志信息 */
export type LogDetails = Record<string, any>;

export type SystemLog = {
  id: number;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  details: LogDetails;
  log_type: string;
  uid: string;
};

/** 系统日志列表结果 */
export type SystemLogsResult = {
  total: number;
  logs: SystemLog[];
};

/** 系统日志列表查询参数 */
export type SystemLogsParams = {
  skip?: number;
  limit?: number;
  level?: string;
  log_type?: string;
  uid?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
};

/** 获取系统日志列表 GET /api/admin/logs */
export async function getSystemLogs(params?: SystemLogsParams) {
  return request<BaseResponse<SystemLogsResult>>('/api/admin/logs', {
    method: 'GET',
    params: {
      skip: params?.skip || 0,
      limit: params?.limit || 10,
      level: params?.level,
      log_type: params?.log_type,
      uid: params?.uid,
      start_date: params?.start_date,
      end_date: params?.end_date,
      search: params?.search,
    },
  });
}

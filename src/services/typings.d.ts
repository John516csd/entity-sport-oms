export interface BaseResponse<T = any> {
  code?: number;
  success?: boolean;
  message: string;
  data?: T;
  request_id?: string;
}

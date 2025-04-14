export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  request_id?: string;
}

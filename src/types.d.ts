// src/types.d.ts
declare module 'axios' {
  export * from 'axios';
  export default function axios(config: any): any; // Basic default export
  export interface AxiosRequestConfig {
    // Add necessary config properties if needed
    timeout?: number;
  }
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }
  export class AxiosError extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse;
    isAxiosError: boolean;
  }
}
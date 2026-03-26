import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from "axios";

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data;
    
    if (code !== 200) {
      const error = new Error(msg || '请求失败');
      (error as any).code = code;
      (error as any).data = data;
      (error as any).msg = msg;
      return Promise.reject(error);
    }
    
    return response.data;
  },
  (error: AxiosError) => {
    if (axios.isCancel(error)) {
      console.log("请求已取消");
      return Promise.reject(error);
    }
    
    console.log("API请求错误:", error.message);

    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// 创建 axios 实例
const api: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器
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

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          // router.push('/login')
          break;
        case 403:
          // 禁止访问
          console.error("Forbidden");
          break;
        case 404:
          // 资源不存在
          console.error("Not Found");
          break;
        case 500:
          // 服务器错误
          console.error("Server Error");
          break;
        default:
          console.error("Unknown Error");
      }
    }
    return Promise.reject(error);
  },
);

export default api;

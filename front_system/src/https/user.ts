import api from './axios'

// 用户相关接口
export const userApi = {
  // 获取用户列表
  getUserList: (params?: any) => {
    return api.get('/users', { params })
  },
  
  // 获取用户详情
  getUserDetail: (id: string | number) => {
    return api.get(`/users/${id}`)
  },
  
  // 创建用户
  createUser: (data: any) => {
    return api.post('/users', data)
  },
  
  // 更新用户
  updateUser: (id: string | number, data: any) => {
    return api.put(`/users/${id}`, data)
  },
  
  // 删除用户
  deleteUser: (id: string | number) => {
    return api.delete(`/users/${id}`)
  },
  
  // 用户登录
  login: (data: { username: string; password: string }) => {
    return api.post('/auth/login', data)
  },
  
  // 用户登出
  logout: () => {
    return api.post('/auth/logout')
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/auth/me')
  }
}
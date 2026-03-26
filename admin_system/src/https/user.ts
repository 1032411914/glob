import api, { type ApiResponse } from './axios'

export interface User {
  id: number
  username: string
  email: string
  role_id: number
  status: string
}

export interface UserListResponse {
  items: User[]
  total: number
}

export const userApi = {
  getUserList: (params?: any): Promise<ApiResponse<UserListResponse>> => {
    return api.get('/users/', { params })
  },
  
  getUserDetail: (id: string | number): Promise<ApiResponse<User>> => {
    return api.get(`/users/${id}`)
  },
  
  createUser: (data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.post('/users/', data)
  },
  
  updateUser: (id: string | number, data: Partial<User>): Promise<ApiResponse<User>> => {
    return api.put(`/users/${id}`, data)
  },
  
  deleteUser: (id: string | number): Promise<ApiResponse<null>> => {
    return api.delete(`/users/${id}`)
  },
  
  verifyPassword: (userId: string | number, password: string): Promise<ApiResponse<null>> => {
    return api.post(`/users/${userId}/verify-password`, { password })
  }
}
import api, { type ApiResponse } from './axios'

export interface LoginResponse {
  token: string
  user: CurrentUser
}

export interface CurrentUser {
  id: number
  username: string
  email: string
  role_id: number
  avatar?: string
  nickname?: string
  bio?: string
}

export const authApi = {
  login: (data: { username: string; password: string }): Promise<ApiResponse<LoginResponse>> => {
    return api.post('/auth/login', data)
  },
  
  logout: (): Promise<ApiResponse<null>> => {
    return api.post('/auth/logout')
  },
  
  getCurrentUser: (): Promise<ApiResponse<CurrentUser>> => {
    return api.get('/auth/me')
  },
  
  updateProfile: (data: Partial<CurrentUser>): Promise<ApiResponse<CurrentUser>> => {
    return api.put('/auth/profile', data)
  },
  
  updatePassword: (data: { old_password: string; new_password: string }): Promise<ApiResponse<null>> => {
    return api.put('/auth/password', data)
  }
}
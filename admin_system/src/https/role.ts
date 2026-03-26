import api, { type ApiResponse } from './axios'

export interface Role {
  id: number
  name: string
  description: string
  userCount?: number
}

export interface RoleListResponse {
  items: Role[]
  total: number
}

export const roleApi = {
  getRoleList: (params?: any): Promise<ApiResponse<RoleListResponse>> => {
    return api.get('/roles/', { params })
  },
  
  getAllRoles: (): Promise<ApiResponse<Role[]>> => {
    return api.get('/roles/all')
  },
  
  getSimpleRoles: (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
    return api.get('/roles/simple')
  },
  
  getRoleDetail: (id: string | number): Promise<ApiResponse<Role>> => {
    return api.get(`/roles/${id}`)
  },
  
  createRole: (data: Partial<Role>): Promise<ApiResponse<Role>> => {
    return api.post('/roles/', data)
  },
  
  updateRole: (id: string | number, data: Partial<Role>): Promise<ApiResponse<Role>> => {
    return api.put(`/roles/${id}`, data)
  },
  
  deleteRole: (id: string | number): Promise<ApiResponse<null>> => {
    return api.delete(`/roles/${id}`)
  },

}
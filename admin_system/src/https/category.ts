import api, { type ApiResponse } from './axios'

export interface Category {
  id: number
  name: string
  description: string
  articleCount?: number
}

export interface CategoryListResponse {
  items: Category[]
  total: number
}

export const categoryApi = {
  getCategoryList: (params?: any): Promise<ApiResponse<CategoryListResponse>> => {
    return api.get('/categories/', { params })
  },
  
  getAllCategories: (): Promise<ApiResponse<Category[]>> => {
    return api.get('/categories/all')
  },
  
  getSimpleCategories: (): Promise<ApiResponse<Array<{ id: number; name: string }>>> => {
    return api.get('/categories/simple')
  },
  
  getCategoryDetail: (id: string | number): Promise<ApiResponse<Category>> => {
    return api.get(`/categories/${id}`)
  },
  
  createCategory: (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return api.post('/categories/', data)
  },
  
  updateCategory: (id: string | number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return api.put(`/categories/${id}`, data)
  },
  
  deleteCategory: (id: string | number): Promise<ApiResponse<null>> => {
    return api.delete(`/categories/${id}`)
  }
}
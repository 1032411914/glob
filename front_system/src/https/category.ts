import api from './axios'

// 分类相关接口
export const categoryApi = {
  // 获取分类列表
  getCategoryList: (params?: any) => {
    return api.get('/categories', { params })
  },
  
  // 获取分类详情
  getCategoryDetail: (id: string | number) => {
    return api.get(`/categories/${id}`)
  },
  
  // 创建分类
  createCategory: (data: any) => {
    return api.post('/categories', data)
  },
  
  // 更新分类
  updateCategory: (id: string | number, data: any) => {
    return api.put(`/categories/${id}`, data)
  },
  
  // 删除分类
  deleteCategory: (id: string | number) => {
    return api.delete(`/categories/${id}`)
  }
}
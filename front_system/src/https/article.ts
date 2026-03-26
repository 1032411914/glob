import api from './axios'

// 文章相关接口
export const articleApi = {
  // 获取文章列表
  getArticleList: (params?: any) => {
    return api.get('/articles', { params })
  },
  
  // 获取文章详情
  getArticleDetail: (id: string | number) => {
    return api.get(`/articles/${id}`)
  },
  
  // 创建文章
  createArticle: (data: any) => {
    return api.post('/articles', data)
  },
  
  // 更新文章
  updateArticle: (id: string | number, data: any) => {
    return api.put(`/articles/${id}`, data)
  },
  
  // 删除文章
  deleteArticle: (id: string | number) => {
    return api.delete(`/articles/${id}`)
  },
  
  // 发布文章
  publishArticle: (id: string | number) => {
    return api.put(`/articles/${id}/publish`)
  },
  
  // 撤回文章
  unpublishArticle: (id: string | number) => {
    return api.put(`/articles/${id}/unpublish`)
  }
}
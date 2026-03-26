import api, { type ApiResponse } from './axios'

export interface Article {
  id: number
  title: string
  content: string
  summary: string
  category_id: number
  author_id: number
  author_name: string
  status: string
  views: number
  created_at: string
  updated_at: string
}

export interface ArticleListResponse {
  items: Article[]
  total: number
}

export const articleApi = {
  getArticleList: (params?: any): Promise<ApiResponse<ArticleListResponse>> => {
    return api.get('/articles/', { params })
  },
  
  getArticleDetail: (id: string | number): Promise<ApiResponse<Article>> => {
    return api.get(`/articles/${id}`)
  },
  
  createArticle: (data: Partial<Article>): Promise<ApiResponse<Article>> => {
    return api.post('/articles/', data)
  },
  
  updateArticle: (id: string | number, data: Partial<Article>): Promise<ApiResponse<Article>> => {
    return api.put(`/articles/${id}`, data)
  },
  
  deleteArticles: (ids: number[]): Promise<ApiResponse<null>> => {
    return api.delete('/articles/', { data: { ids } })
  },
}
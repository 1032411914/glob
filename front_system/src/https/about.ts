import api from './axios'

// 关于页面数据接口
export const aboutApi = {
  getAbout: () => api.get('/about')
}

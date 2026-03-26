import { makeAutoObservable } from 'mobx'

class UserStore {
  userId: string | null = localStorage.getItem('userId')

  constructor() {
    makeAutoObservable(this)
  }

  // 保存用户id到本地缓存
  saveUserId(id: number) {
    this.userId = id.toString()
    localStorage.setItem('userId', id.toString())
  }

  // 清除用户id
  clearUserId() {
    this.userId = null
    localStorage.removeItem('userId')
  }

  // 获取用户id
  getUserId() {
    return this.userId
  }
}

export default new UserStore()
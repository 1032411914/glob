import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Modal, Form, Input, message, Button } from 'antd'
import { DashboardOutlined, FileTextOutlined, TeamOutlined, AppstoreOutlined, SettingOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import '@/App.css'
import userStore from '@src/stores/userStore'
import { authApi, type CurrentUser } from '@src/https/auth'

const { Header, Content, Sider } = Layout

const MainLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authApi.getCurrentUser()
        setCurrentUser(response.data)
        // 使用mobx保存用户id到本地缓存
        if (response.data && response.data.id) {
          userStore.saveUserId(response.data.id)
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error)
      }
    }
    
    fetchCurrentUser()
  }, [])
  
  const handleProfileUpdate = async (values: any) => {
    setProfileLoading(true)
    try {
      await authApi.updateProfile(values)
      message.success('个人资料更新成功')
      const response = await authApi.getCurrentUser()
      setCurrentUser(response.data)
      setProfileModalVisible(false)
    } catch (error: any) {
      message.error(error.msg || '更新失败')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (values: any) => {
    setPasswordLoading(true)
    try {
      await authApi.updatePassword({
        old_password: values.old_password,
        new_password: values.new_password
      })
      message.success('密码修改成功')
      passwordForm.resetFields()
      setPasswordModalVisible(false)
    } catch (error: any) {
      message.error(error.msg || '密码修改失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return ['dashboard']
    if (path.startsWith('/articles')) return ['articles']
    if (path.startsWith('/categories')) return ['categories']
    if (path.startsWith('/users')) return ['users']
    if (path.startsWith('/roles')) return ['roles']
    return ['dashboard']
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" selectedKeys={getSelectedKey()} items={[
          { key: 'dashboard', label: <Link to="/dashboard">控制台</Link> },
          { 
            key: 'user', 
            label: (
              <Dropdown menu={{ items: [
                {
                  key: 'profile',
                  label: '个人资料',
                  onClick: () => {
                    profileForm.setFieldsValue({
                      avatar: currentUser?.avatar,
                      nickname: currentUser?.nickname,
                      bio: currentUser?.bio
                    })
                    setProfileModalVisible(true)
                  }
                },
                {
                  key: 'password',
                  label: '修改密码',
                  onClick: () => {
                    passwordForm.resetFields()
                    setPasswordModalVisible(true)
                  }
                },
                {
                  key: 'logout',
                  label: '退出登录',
                  onClick: async () => {
                    await authApi.logout()
                    userStore.clearUserId()
                    navigate('/login')
                  }
                }
              ] }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', cursor: 'pointer' }}>
                  <Avatar 
                    src={currentUser?.avatar} 
                    alt={currentUser?.nickname || currentUser?.username}
                    icon={<UserOutlined />}
                  />
                  <span>{currentUser?.nickname || currentUser?.username || '未知用户'}</span>
                </div>
              </Dropdown>
            ) 
          }
        ]} />
      </Header>
      <Layout>
        <Sider width={200} theme="dark">
          <Menu mode="inline" selectedKeys={getSelectedKey()} items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">控制台首页</Link> },
            { key: 'articles', icon: <FileTextOutlined />, label: <Link to="/articles">文章管理</Link> },
            { key: 'categories', icon: <AppstoreOutlined />, label: <Link to="/categories">分类管理</Link> },
            { key: 'users', icon: <TeamOutlined />, label: <Link to="/users">用户管理</Link> },
            { key: 'roles', icon: <SettingOutlined />, label: <Link to="/roles">角色管理</Link> }
          ]} />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ margin: '24px 0', padding: 24, background: '#fff', minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <Modal
        title="个人资料"
        open={profileModalVisible}
        onCancel={() => {
          setProfileModalVisible(false)
          profileForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
          <div style={{ flex: '0 0 auto' }}>
            <Avatar
              size={100}
              src={currentUser?.avatar}
              icon={<UserOutlined />}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Form.Item
                name="avatar"
                label="头像URL"
              >
                <Input placeholder="请输入头像URL" />
              </Form.Item>
              <Form.Item
                name="nickname"
                label="昵称"
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item
                name="bio"
                label="个人简介"
              >
                <Input.TextArea placeholder="请输入个人简介" rows={3} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="old_password"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度至少为6个字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="确认新密码"
            dependencies={['new_password']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passwordLoading}>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default MainLayout
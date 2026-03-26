import { Navigate } from 'react-router-dom'
import MainLayout from '@layouts/MainLayout'
import Login from '@pages/login'
import Dashboard from '@pages/dashboard'
import ArticleManagement from '@pages/articles'
import CategoryManagement from '@pages/categories'
import UserManagement from '@pages/users'
import RoleManagement from '@pages/roles'

const routes = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'articles',
        element: <ArticleManagement />
      },
      {
        path: 'categories',
        element: <CategoryManagement />
      },
      {
        path: 'users',
        element: <UserManagement />
      },
      {
        path: 'roles',
        element: <RoleManagement />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]

export default routes
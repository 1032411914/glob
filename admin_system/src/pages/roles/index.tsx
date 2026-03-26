import { Button, Table, Space, Typography, Modal, Form, Input, message, Spin } from 'antd'
import { useState, useEffect } from 'react'
import { roleApi } from '@src/https'

const { Title } = Typography
const { Item } = Form

interface Role {
  id: string | number
  name: string
  description: string
  userCount: number
}

const RoleManagement = () => {
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
    },

    {
      title: '操作',
      key: 'action',
      render: (record: Role) => (
        <Space size="middle">
          <Button size="small" onClick={() => handleEdit(record)}>编辑</Button>
          {!['管理员', '普通用户'].includes(record.name) && (
            <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
          )}
        </Space>
      ),
    },
  ]

  const fetchRoles = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true)
      const response = await roleApi.getRoleList({ page, page_size: size })
      const data = response.data || { items: [], total: 0 }
      const roleList = data.items || []
      setTotal(data.total || 0)
      setRoles(roleList.map((item: any) => ({
        key: item.id,
        id: item.id,
        name: item.name,
        description: item.description || '',
        userCount: item.userCount || 0
      })))
    } catch (error: any) {
      console.error('获取角色列表失败:', error)
      message.error(error.msg || '获取角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  const showModal = () => {
    setEditingRole(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    })
    setIsModalVisible(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      if (editingRole) {
        await roleApi.updateRole(editingRole.id, values)
        message.success('角色更新成功')
      } else {
        await roleApi.createRole(values)
        message.success('角色创建成功')
      }
      
      form.resetFields()
      setEditingRole(null)
      setIsModalVisible(false)
      fetchRoles(currentPage, pageSize)
    } catch (error: any) {
      message.error(error.msg || (editingRole ? '角色更新失败' : '角色创建失败'))
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setEditingRole(null)
    setIsModalVisible(false)
  }

  const handleDelete = async (id: string | number) => {
    try {
      await roleApi.deleteRole(id)
      message.success('删除成功')
      fetchRoles(currentPage, pageSize)
    } catch (error: any) {
      message.error(error.msg || '删除失败')
    }
  }

  useEffect(() => {
    fetchRoles(currentPage, pageSize)
  }, [currentPage, pageSize])

  return (
    <div>
      <Title level={2}>角色管理</Title>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={showModal}>
        新建角色
      </Button>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={roles}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
        />
      </Spin>

      <Modal
        title={editingRole ? "编辑角色" : "新建角色"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Item>
          <Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入角色描述" />
          </Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoleManagement
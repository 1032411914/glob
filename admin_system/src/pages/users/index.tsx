import {
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Select,
} from "antd";
import { useState, useEffect } from "react";
import { userApi, roleApi } from "@src/https";
import type { Role } from "@src/https/role";

const { Title } = Typography;
const { Item } = Form;

interface User {
  id: string | number;
  username: string;
  email: string;
  password: string;
  role_id: string | number;
  avatar?: string;
  nickname?: string;
  bio?: string;
}

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // 密码验证相关状态
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [actionType, setActionType] = useState<"edit" | "delete" | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | number | null>(
    null,
  );

  const columns = [
    {
      title: "头像",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar: string) => (
        <img
          src={
            avatar ||
            "https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=128x128"
          }
          alt="头像"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
      ),
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "昵称",
      dataIndex: "nickname",
      key: "nickname",
      render: (nickname: string) => nickname || "-",
    },
    {
      title: "个人简介",
      dataIndex: "bio",
      key: "bio",
      render: (bio: string) => bio || "-",
    },
    {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "角色",
      dataIndex: "role_id",
      key: "role",
      render: (role_id: string) => {
        const roleColor = Number(role_id) === 1 ? "red" : "blue";
        return (
          <Tag color={roleColor}>
            {roles.find((item) => item.id === Number(role_id))?.name ||
              "未知角色"}
          </Tag>
        );
      },
    },

    {
      title: "操作",
      key: "action",
      render: (record: User) => (
        <Space size="middle">
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {!["admin", "guest"].includes(record.username) && (
            <Button size="small" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await roleApi.getAllRoles();
      setRoles(response.data || []);
    } catch (error: any) {
      console.error("获取角色列表失败:", error);
      message.error(error.msg || "获取角色列表失败");
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchUsers = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response = await userApi.getUserList({ page, page_size: size });
      const data = response.data || { items: [], total: 0 };
      const userList = data.items || [];
      setTotal(data.total || 0);

      // 为每个用户添加角色名称
      const usersWithRoleNames = userList.map((item: any) => {
        return {
          key: item.id,
          id: item.id,
          username: item.username,
          email: item.email,
          role_id: item.role_id,
          password: item.password,
          avatar: item.avatar,
          nickname: item.nickname,
          bio: item.bio,
        };
      });

      setUsers(usersWithRoleNames);
    } catch (error: any) {
      console.error("获取用户列表失败:", error);
      message.error(error.msg || "获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    // 保存目标用户ID、操作类型和编辑用户信息
    setTargetUserId(user.id);
    setActionType("edit");
    setEditingUser(user); // 关键：设置 editingUser 状态
    // 显示密码验证模态框
    setVerifyModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 将 role_id 转换为数字类型
      let submitValues = {
        ...values,
        role_id: Number(values.role_id),
      };

      if (editingUser) {
        // 编辑用户时，不提交密码字段
        delete submitValues.password;
        await userApi.updateUser(editingUser.id, submitValues);
        message.success("用户更新成功");
      } else {
        await userApi.createUser(submitValues);
        message.success("用户创建成功");
      }

      form.resetFields();
      setEditingUser(null);
      setIsModalVisible(false);
      fetchUsers(currentPage, pageSize);
    } catch (error: any) {
      message.error(
        error.msg || (editingUser ? "用户更新失败" : "用户创建失败"),
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingUser(null);
    setIsModalVisible(false);
  };

  const handleVerifyCancel = () => {
    setVerifyModalVisible(false);
    setVerifyPassword("");
    setActionType(null);
    setTargetUserId(null);
  };

  const handleDelete = (id: string | number) => {
    // 保存目标用户ID和操作类型
    setTargetUserId(id);
    setActionType("delete");
    // 显示密码验证模态框
    setVerifyModalVisible(true);
  };

  // 验证密码
  const handleVerifyPassword = async () => {
    if (!verifyPassword) {
      message.warning("请输入密码");
      return;
    }

    try {
      setVerifyLoading(true);

      // 确定要验证的用户ID
      const userId =
        actionType === "edit" && editingUser ? editingUser.id : targetUserId;

      if (!userId) {
        message.error("用户ID不存在");
        return;
      }

      // 调用后端密码验证API，传递用户ID
      await userApi.verifyPassword(userId, verifyPassword);

      // 验证通过，执行相应操作
      if (actionType === "edit" && editingUser) {
        // 编辑操作
        form.setFieldsValue({
          username: editingUser.username,
          email: editingUser.email,
          role_id: editingUser.role_id,
          password: editingUser.password,
        });
        setVerifyModalVisible(false);
        setIsModalVisible(true);
      } else if (actionType === "delete" && targetUserId) {
        try {
          // 执行删除操作
          await userApi.deleteUser(targetUserId);
          message.success("删除成功");
          setVerifyModalVisible(false);
          fetchUsers(currentPage, pageSize);
        } catch (error: any) {
          message.error(error.msg || "删除失败");
        }
      }
    } catch (error: any) {
      message.error(error.msg || "密码验证失败");
    } finally {
      setVerifyLoading(false);
      setVerifyPassword("");
    }
  };

  useEffect(() => {
    // 先获取角色列表，再获取用户列表
    const initData = async () => {
      await fetchRoles();
      await fetchUsers(currentPage, pageSize);
    };
    initData();
  }, [currentPage, pageSize]);

  // 当角色列表变化时，重新获取用户列表以更新角色名称
  useEffect(() => {
    if (roles.length > 0) {
      fetchUsers(currentPage, pageSize);
    }
  }, [roles, currentPage, pageSize]);

  return (
    <div>
      <Title level={2}>用户管理</Title>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={showModal}>
        新建用户
      </Button>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
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
        title={editingUser ? "编辑用户" : "新建用户"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名长度至少为3个字符" },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Item>
          <Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入正确的邮箱格式" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Item>
          <Item
            name="password"
            label="密码"
            rules={[
              { required: !editingUser, message: "请输入密码" },
              { min: 6, message: "密码长度至少为6个字符" },
            ]}
          >
            {editingUser ? (
              <Input placeholder="密码（编辑时显示明文）" />
            ) : (
              <Input.Password placeholder="请输入密码" />
            )}
          </Item>
          <Item
            name="role_id"
            label="角色"
            rules={[{ required: true, message: "请选择角色" }]}
          >
            <Select 
              placeholder="请选择角色" 
              loading={rolesLoading}
              options={roles.map((role) => ({
                label: role.name,
                value: role.id
              }))}
            />
          </Item>
        </Form>
      </Modal>

      {/* 密码验证模态框 */}
      <Modal
        title={actionType === "edit" ? "编辑验证" : "删除验证"}
        open={verifyModalVisible}
        onOk={handleVerifyPassword}
        onCancel={handleVerifyCancel}
        confirmLoading={verifyLoading}
      >
        <p>
          {actionType === "edit"
            ? "请输入密码以验证身份，然后进行编辑操作"
            : "请输入密码以验证身份，然后进行删除操作"}
        </p>
        <Input.Password
          placeholder="请输入密码"
          value={verifyPassword}
          onChange={(e) => setVerifyPassword(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;

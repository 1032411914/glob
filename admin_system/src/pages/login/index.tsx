import { useState } from "react";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authApi } from "@https";
import userStore from "@stores/userStore";

const { Title } = Typography;
const { Item } = Form;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      // 存储token
      localStorage.setItem("token", response.data.token);
      // 使用mobx保存用户id到本地缓存
      if (response.data.user && response.data.user.id) {
        userStore.saveUserId(response.data.user.id);
      }
      message.success("登录成功");
      navigate("/dashboard");
    } catch (error: any) {
      message.error(error.msg || "登录失败，请检查用户名和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          管理员登录
        </Title>
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Item>
          <Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="密码"
            />
          </Item>
          <Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              登录
            </Button>
          </Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;

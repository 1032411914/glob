import { Card, Typography, Spin } from "antd";
import { useEffect, useState } from "react";
import { articleApi, userApi } from "@src/https";

const { Title, Text } = Typography;

interface DashboardStats {
  articleCount: number;
  userCount: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    articleCount: 0,
    userCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articles, users] = await Promise.all([
          articleApi.getArticleList({ page: 1, page_size: 1000 }), // 获取足够多的文章来统计总数
          userApi.getUserList(),
        ]);
        setStats({
          articleCount: articles.data.total || 0,
          userCount: users.data.items.length || 0,
        });
      } catch (error) {
        console.error("获取统计数据失败:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      />
    );
  }

  return (
    <div>
      <Title level={2}>控制台首页</Title>
      <Card style={{ marginBottom: 16 }}>
        <Text>欢迎来到博客管理系统</Text>
      </Card>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Card style={{ flex: 1 }}>
          <Title level={4}>文章数量</Title>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {stats.articleCount}
          </Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <Title level={4}>用户数量</Title>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            {stats.userCount}
          </Text>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

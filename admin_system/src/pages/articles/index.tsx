import {
  Button,
  Table,
  Space,
  Typography,
  Spin,
  message,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { articleApi, categoryApi } from "@src/https";
import userStore from "@src/stores/userStore";

const { TextArea } = Input;

const { Title } = Typography;

interface Article {
  id: string | number;
  title: string;
  summary: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

const ArticleManagement = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<
    string | number | null
  >(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 文章表单相关状态
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [categories, setCategories] = useState<any[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const columns = [
    {
      title: "文章标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "文章摘要",
      dataIndex: "summary",
      key: "summary",
      ellipsis: true,
      width: 300,
    },
    {
      title: "分类",
      dataIndex: "category_name",
      key: "category_name",
    },
    {
      title: "作者",
      dataIndex: "author_name",
      key: "author_name",
    },
    {
      title: "操作",
      key: "action",
      render: (record: Article) => (
        <Space size="middle">
          <Button size="small" onClick={() => handlePreview(record.id)}>
            预览
          </Button>
          <Button size="small" onClick={() => handleEdit(record.id)}>
            编辑
          </Button>
          {record.title !== "欢迎使用博客系统" && (
            <Button size="small" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const fetchArticles = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response = await articleApi.getArticleList({
        page,
        page_size: size,
      });
      const data = response.data || { items: [], total: 0 };
      const articleList = data.items || [];
      setTotal(data.total || 0);
      setArticles(
        articleList.map((item: any) => ({
          key: item.id,
          id: item.id,
          title: item.title,
          summary: item.summary || "",
          category_name: item.category_name || "未分类",
          created_at: item.created_at,
          updated_at: item.updated_at,
          author_name: item.author_name || "未知作者",
        })),
      );
    } catch (error: any) {
      message.error(error.msg || "获取文章列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await articleApi.deleteArticles([id as number]);
      message.success("删除成功");
      // 从选中项中移除已删除的文章ID
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
      fetchArticles(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.msg || "删除失败");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请选择要删除的文章");
      return;
    }

    try {
      setDeleteLoading(true);
      const ids = selectedRowKeys.map((key) => Number(key));
      await articleApi.deleteArticles(ids);
      message.success(`成功删除 ${selectedRowKeys.length} 篇文章`);
      setSelectedRowKeys([]);
      fetchArticles(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.msg || "批量删除失败");
    } finally {
      setDeleteLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      // 过滤掉系统默认文章
      const filteredKeys = newSelectedRowKeys.filter((key) => {
        const article = articles.find((a) => a.id === Number(key));
        return article && article.title !== "欢迎使用博客系统";
      });
      setSelectedRowKeys(filteredKeys);
    },
    // 禁用系统默认文章的选择
    getCheckboxProps: (record: any) => ({
      disabled: record.title === "欢迎使用博客系统",
    }),
  };

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (id: string | number) => {
    setCurrentArticleId(id);
    setEditModalOpen(true);
  };

  const handlePreview = async (id: string | number) => {
    try {
      setPreviewLoading(true);
      const response = await articleApi.getArticleDetail(id);
      setPreviewArticle(response.data.content);
      setPreviewModalOpen(true);
    } catch (error: any) {
      message.error(error.msg || "获取文章详情失败");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePreviewClose = () => {
    setPreviewModalOpen(false);
    setPreviewArticle("");
  };

  // 获取分类列表
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getSimpleCategories();
      setCategories(response.data || []);
    } catch (error: any) {
      message.error(error.msg || "获取分类列表失败");
    }
  };

  // 创建文章
  const handleCreateSubmit = async (values: any) => {
    try {
      const userId = userStore.userId;
      if (!userId) {
        message.error("用户未登录");
        return;
      }
      
      const submitData = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        category_id: values.category_id,
        author_id: parseInt(userId),
      };

      await articleApi.createArticle(submitData);
      message.success("创建成功");
      createForm.resetFields();
      setCreateModalOpen(false);
      fetchArticles(currentPage, pageSize);
    } catch (error: any) {
      console.error("创建失败:", error);
      message.error(error.msg || "创建失败");
    }
  };

  // 编辑文章
  const fetchArticleDetail = async () => {
    if (!currentArticleId) return;
    try {
      setEditLoading(true);
      const response = await articleApi.getArticleDetail(currentArticleId);
      const article = response.data;
      editForm.resetFields();
      editForm.setFieldsValue({
        title: article.title,
        content: article.content,
        summary: article.summary,
        category_id: article.category_id,
        author_name: article.author_name,
        created_at: article.created_at,
        updated_at: article.updated_at,
      });
    } catch (error: any) {
      message.error(error.msg || "获取文章详情失败");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!currentArticleId) return;
    try {
      const submitData = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        category_id: values.category_id,
      };

      await articleApi.updateArticle(currentArticleId, submitData);
      message.success("更新成功");
      editForm.resetFields();
      setEditModalOpen(false);
      setCurrentArticleId(null);
      fetchArticles(currentPage, pageSize);
    } catch (error: any) {
      console.error("更新失败:", error);
      message.error(error.msg || "更新失败");
    }
  };

  const handleCreateCancel = () => {
    createForm.resetFields();
    setCreateModalOpen(false);
  };

  const handleEditCancel = () => {
    editForm.resetFields();
    setEditModalOpen(false);
    setCurrentArticleId(null);
  };

  useEffect(() => {
    fetchArticles(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // 打开创建模态框时获取分类
  useEffect(() => {
    if (createModalOpen) {
      createForm.resetFields();
      createForm.setFieldsValue({ status: 0 });
      fetchCategories();
    }
  }, [createModalOpen, createForm]);

  // 打开编辑模态框时获取文章详情和分类
  useEffect(() => {
    if (editModalOpen && currentArticleId) {
      fetchArticleDetail();
      fetchCategories();
    }
  }, [editModalOpen, currentArticleId]);

  useEffect(() => {
    if (articles.length > 0 && selectedRowKeys.length > 0) {
      const articleIds = articles.map((article) => article.id);
      const validSelectedKeys = selectedRowKeys.filter((key) =>
        articleIds.includes(Number(key)),
      );
      if (validSelectedKeys.length !== selectedRowKeys.length) {
        setSelectedRowKeys(validSelectedKeys);
      }
    }
  }, [articles]);

  return (
    <div>
      <Title level={2}>文章管理</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleCreate}>
          新建文章
        </Button>
        <Popconfirm
          title="确定要删除选中的文章吗？"
          description="删除后无法恢复"
          onConfirm={handleBatchDelete}
          okText="确定"
          cancelText="取消"
          disabled={selectedRowKeys.length === 0}
        >
          <Button
            danger
            disabled={selectedRowKeys.length === 0}
            loading={deleteLoading}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>
        </Popconfirm>
      </Space>
      <Spin spinning={loading}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={articles}
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

      {/* 新建文章模态框 */}
      <Modal
        title="新建文章"
        open={createModalOpen}
        onCancel={handleCreateCancel}
        footer={null}
        width={800}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit}>
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="文章内容"
            rules={[{ required: true, message: "请输入文章内容" }]}
          >
            <TextArea rows={10} placeholder="请输入文章内容" />
          </Form.Item>
          <Form.Item
            name="summary"
            label="文章摘要"
            rules={[{ required: true, message: "请输入文章摘要" }]}
          >
            <TextArea rows={3} placeholder="请输入文章摘要" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: "请选择分类" }]}
          >
            <Select
              placeholder="请选择分类"
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCreateCancel}>取消</Button>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑文章模态框 */}
      <Modal
        title="编辑文章"
        open={editModalOpen}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
        confirmLoading={editLoading}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item
            name="title"
            label="文章标题"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="文章内容"
            rules={[{ required: true, message: "请输入文章内容" }]}
          >
            <TextArea rows={10} placeholder="请输入文章内容" />
          </Form.Item>
          <Form.Item
            name="summary"
            label="文章摘要"
            rules={[{ required: true, message: "请输入文章摘要" }]}
          >
            <TextArea rows={3} placeholder="请输入文章摘要" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: "请选择分类" }]}
          >
            <Select
              placeholder="请选择分类"
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="作者" name="author_name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="创建时间" name="created_at">
            <Input disabled />
          </Form.Item>
          <Form.Item label="修改时间" name="updated_at">
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleEditCancel}>取消</Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                更新
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览文章模态框 */}
      <Modal
        title="文章预览"
        open={previewModalOpen}
        onCancel={handlePreviewClose}
        footer={[
          <Button key="close" onClick={handlePreviewClose}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Spin spinning={previewLoading}>
          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
            }}
          >
            {previewArticle}
          </div>
        </Spin>
      </Modal>
    </div>
  );
};

export default ArticleManagement;

import {
  Button,
  Table,
  Space,
  Typography,
  Input,
  Modal,
  Form,
  message,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import { categoryApi } from "@src/https";

const { Title } = Typography;
const { Item } = Form;

interface Category {
  id: string | number;
  name: string;
  description: string;
  articleCount: number;
}

const CategoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      title: "分类名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "分类描述",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "文章数量",
      dataIndex: "articleCount",
      key: "articleCount",
    },
    {
      title: "操作",
      key: "action",
      render: (record: Category) => (
        <Space size="middle">
          <Button size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {!['技术', '其他'].includes(record.name) && (
            <Button size="small" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const fetchCategories = async (page: number = 1, size: number = 10) => {
    try {
      setLoading(true);
      const response = await categoryApi.getCategoryList({ page, page_size: size });
      const data = response.data || { items: [], total: 0 };
      const categoryList = data.items || [];
      setTotal(data.total || 0);
      setCategories(
        categoryList.map((item: any) => ({
          key: item.id,
          id: item.id,
          name: item.name,
          description: item.description || "",
          articleCount: item.articleCount || 0,
        })),
      );
    } catch (error: any) {
      console.error("获取分类列表失败:", error);
      message.error(error.msg || "获取分类列表失败");
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingCategory) {
        await categoryApi.updateCategory(
          editingCategory.id,
          values,
        );
        message.success("分类更新成功");
      } else {
        await categoryApi.createCategory(values);
        message.success("分类创建成功");
      }

      form.resetFields();
      setEditingCategory(null);
      setIsModalVisible(false);
      fetchCategories(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.msg || (editingCategory ? "分类更新失败" : "分类创建失败"));
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingCategory(null);
    setIsModalVisible(false);
  };

  const handleDelete = async (id: string | number) => {
    try {
      await categoryApi.deleteCategory(id);
      message.success("删除成功");
      fetchCategories(currentPage, pageSize);
    } catch (error: any) {
      message.error(error.msg || "删除失败");
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, pageSize);
  }, [currentPage, pageSize]);

  return (
    <div>
      <Title level={2}>分类管理</Title>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={showModal}>
        新建分类
      </Button>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={categories}
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
        title={editingCategory ? "编辑分类" : "新建分类"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: "请输入分类名称" }]}
          >
            <Input placeholder="请输入分类名称" />
          </Item>
          <Item
            name="description"
            label="分类描述"
            rules={[{ required: true, message: "请输入分类描述" }]}
          >
            <Input.TextArea rows={4} placeholder="请输入分类描述" />
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;

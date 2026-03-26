<template>
  <div class="category-detail">
    <h1 class="page-title">{{ category.name }}</h1>
    <p class="category-meta">包含 {{ category.description || 0 }} 篇文章</p>
    <div v-if="loading"
         class="loading">
      <p>加载中...</p>
    </div>
    <div v-else-if="category"
         class="category-content">

      <div class="article-list">
        <div v-for="article in articles"
             :key="article.id"
             class="article-item">
          <h3 class="article-title">
            <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
          </h3>
          <div class="article-meta">
            <span class="date">{{ formatDate(article.created_at) }}</span>
          </div>
          <p class="article-summary">{{ article.summary || article.content.substring(0, 150) }}...</p>
        </div>
        <div v-if="articles.length === 0"
             class="empty-state">
          <p>该分类下暂无文章</p>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > 0"
           class="pagination">
        <button @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="page-btn">
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="page-btn">
          下一页
        </button>
      </div>
    </div>
    <div v-else
         class="error">
      <p>分类不存在或已被删除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { categoryApi, articleApi } from '@https'

interface Category {
  id: number
  name: string
  description: number
}

interface Article {
  id: number
  title: string
  content: string
  summary: string
  category_id: number
  category_name: string
  author_id: number
  author_name: string
  created_at: string
  updated_at: string
}

const route = useRoute()
const category = ref({} as Category)
const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const fetchCategoryDetail = async () => {
  const id = route.params.id

  if (id) {
    try {
      const categoryId = Array.isArray(id) ? id[0] : id
      const data = await categoryApi.getCategoryDetail(categoryId)
      if (data && data.data) {
        category.value = data.data
      }
    } catch (error) {
      console.error('获取分类详情失败:', error)
    }
  }
}

const fetchArticles = async () => {
  const id = route.params.id
  if (id) {
    try {
      const categoryId = Array.isArray(id) ? id[0] : id
      const data = await articleApi.getArticleList({
        page: currentPage.value,
        page_size: pageSize.value,
        category_id: categoryId,
      })
      if (data && data.data) {
        articles.value = data.data.items
        total.value = data.data.total
      }
    } catch (error) {
      console.error('获取文章列表失败:', error)
    }
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchArticles()
  }
}

onMounted(async () => {
  await fetchCategoryDetail()
  await fetchArticles()
  loading.value = false
})
</script>

<style scoped>
.category-detail {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.error {
  text-align: center;
  padding: 3rem 0;
  color: #ff4d4f;
}

.category-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.category-meta {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.article-item {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.article-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.article-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
}

.article-title a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.article-title a:hover {
  color: #007bff;
}

.article-meta {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
}

.article-summary {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  background-color: #fff;
  border: 1px solid #eaeaea;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #666;
}

@media (max-width: 768px) {
  .category-content {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .article-item {
    padding-bottom: 1rem;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
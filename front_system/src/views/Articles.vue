<template>
  <div class="articles">
    <h1 class="page-title">文章列表</h1>
    <div class="article-list">
      <div v-for="article in articles" :key="article.id" class="article-item">
        <h3 class="article-title">
          <router-link :to="`/articles/${article.id}`">{{ article.title }}</router-link>
        </h3>
        <div class="article-meta">
          <span class="category">{{ article.category_name || '未分类' }}</span>
          <span class="date">{{ formatDate(article.created_at) }}</span>
        </div>
        <p class="article-summary">{{ article.summary || article.content.substring(0, 150) }}...</p>
      </div>
      <div v-if="articles.length === 0" class="empty-state">
        <p>暂无文章</p>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <button 
        @click="changePage(currentPage - 1)" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        @click="changePage(currentPage + 1)" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { articleApi } from '@https';

interface Article {
  id: number;
  title: string;
  content: string;
  summary: string;
  category_id: number;
  category_name: string;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

const articles = ref<Article[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value);
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchArticles = async () => {
  try {
    const data = await articleApi.getArticleList({
      page: currentPage.value,
      page_size: pageSize.value
    });
    if (data && data.data) {
      articles.value = data.data.items;
      total.value = data.data.total;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
  }
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchArticles();
  }
};

onMounted(() => {
  fetchArticles();
});
</script>

<style scoped>
.articles {
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.article-item {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
}

.category {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
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
  .page-title {
    font-size: 1.5rem;
  }
  
  .article-item {
    padding: 1rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
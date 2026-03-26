<template>
  <div class="article-detail">
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    <div v-else-if="article" class="article-content">
      <h1 class="article-title">{{ article.title }}</h1>
      <div class="article-meta">
        <span class="category">{{ article.category_name || '未分类' }}</span>
        <span class="date">{{ formatDate(article.created_at) }}</span>
        <span class="author">{{ article.author_name || '未知作者' }}</span>
      </div>
      <div class="article-body" v-html="article.content"></div>
    </div>
    <div v-else class="error">
      <p>文章不存在或已被删除</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
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

const route = useRoute();
const article = ref<Article | null>(null);
const loading = ref(true);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      // 确保id是字符串或数字类型
      const articleId = Array.isArray(id) ? id[0] : id;
      const data = await articleApi.getArticleDetail(articleId);
      if (data && data.data) {
        article.value = data.data;
      }
    } catch (error) {
      console.error('获取文章详情失败:', error);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.article-detail {
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

.article-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.article-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #333;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.category {
  background-color: #f0f0f0;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

.article-body {
  color: #333;
  line-height: 1.8;
}

.article-body p {
  margin-bottom: 1.5rem;
}

.article-body h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 2rem 0 1rem;
  color: #333;
}

.article-body h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  color: #333;
}

.article-body img {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.article-body code {
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
}

.article-body pre {
  background-color: #f0f0f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.article-body pre code {
  background-color: transparent;
  padding: 0;
}

@media (max-width: 768px) {
  .article-content {
    padding: 1.5rem;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-meta {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}
</style>
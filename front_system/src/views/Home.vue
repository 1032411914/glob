<template>
  <div class="home">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>围·城</h1>
        <p>记录生活，分享思考</p>
      </div>
    </section>
    
    <!-- 文章列表 -->
    <section class="article-section">
      <h2 class="section-title">最新文章</h2>
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
  try {
    const data = await articleApi.getArticleList({ page: 1, page_size: 10 });
    if (data && data.data) {
      articles.value = data.data.items;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
  }
});
</script>

<style scoped>
.home {
  width: 100%;
}

.hero {
  background-color: #f0f0f0;
  padding: 4rem 0;
  margin-bottom: 2rem;
  border-radius: 8px;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-content {
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.hero-content p {
  font-size: 1.25rem;
  color: #666;
  margin: 0;
}

.article-section {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eaeaea;
  color: #333;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

@media (max-width: 768px) {
  .hero {
    padding: 2rem 0;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .article-item {
    padding: 1rem;
  }
}
</style>
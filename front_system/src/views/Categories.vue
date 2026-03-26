<template>
  <div class="categories">
    <h1 class="page-title">分类列表</h1>
    <div class="category-list">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
      >
        <h3 class="category-title">
          <router-link :to="`/categories/${category.id}`">{{
            category.name
          }}</router-link>
        </h3>
        <p class="category-count">{{ category.articleCount || 0 }} 篇文章</p>
      </div>
      <div v-if="categories.length === 0" class="empty-state">
        <p>暂无分类</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { categoryApi } from "@https";

interface Category {
  id: number;
  name: string;
  articleCount?: number;
}

const categories = ref<Category[]>([]);

onMounted(async () => {
  try {
    const {data} = await categoryApi.getCategoryList();

    if (data) {
      categories.value = data.items;
    }
  } catch (error) {
    console.error("获取分类列表失败:", error);
  }
});
</script>

<style scoped>
.categories {
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.category-item {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.category-title a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.category-title a:hover {
  color: #007bff;
}

.category-count {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 8px;
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .category-list {
    grid-template-columns: 1fr;
  }

  .category-item {
    padding: 1rem;
  }
}
</style>

<template>
  <div class="about" v-if="aboutData">
    <h1 class="page-title">{{ aboutData.title || '关于我' }}</h1>
    <div class="about-content">
      <section class="about-section" v-for="(para, idx) in aboutData.intro" :key="idx">
        <p>{{ para }}</p>
      </section>

      <section class="about-section" v-if="aboutData.tech_stack && aboutData.tech_stack.length">
        <h2>技术栈</h2>
        <ul class="tech-stack">
          <li v-for="(t, i) in aboutData.tech_stack" :key="i">{{ t }}</li>
        </ul>
      </section>

      <section class="about-section" v-if="aboutData.contact?.email">
        <h2>联系我</h2>
        <p>邮箱：{{ aboutData.contact.email }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { aboutApi } from '@https'

interface AboutData {
  title: string
  intro: string[]
  tech_stack: string[]
  contact: { email: string }
}

const aboutData = ref<AboutData | null>(null)

onMounted(async () => {
  try {
    const res: any = await aboutApi.getAbout()
    // 兼容不同后端返回结构
    if (res && res.data) {
      aboutData.value = res.data
    } else {
      aboutData.value = res as AboutData
    }
  } catch (e) {
    console.error('获取关于信息失败', e)
  }
})
</script>

<style scoped>
.about {
  width: 100%;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

.about-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.about-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eaeaea;
}

.about-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.about-section h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.about-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tech-stack {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.tech-stack li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.tech-stack li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #007bff;
  font-weight: bold;
}

@media (max-width: 768px) {
  .page-title { font-size: 1.5rem; }
  .about-content { padding: 1.5rem; }
}
</style>

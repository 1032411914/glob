<template>
  <div class="app">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <router-link to="/">博客网站</router-link>
          </div>
          <nav class="nav">
            <router-link to="/">首页</router-link>
            <router-link to="/articles">文章</router-link>
            <router-link to="/categories">分类</router-link>
            <router-link to="/about">关于</router-link>
          </nav>
        </div>
      </div>
    </header>
    <main class="main">
      <div class="container">
        <router-view></router-view>
      </div>
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p>© {{ new Date() }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  color: #333;
}

.container {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.logo a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.logo a:hover {
  color: #007bff;
}

.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-size: 1rem;
  transition: color 0.3s;
  padding: 0.5rem 0;
  position: relative;
}

.nav a:hover {
  color: #007bff;
}

.nav a.router-link-active {
  color: #007bff;
}

.nav a.router-link-active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #007bff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eaeaea;
}

.nickname {
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #eaeaea;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-content {
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.footer-content p {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .nav {
    width: 100%;
    justify-content: space-between;
  }

  .main {
    padding: 1rem 0;
  }
}
</style>

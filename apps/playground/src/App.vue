<template>
  <a-theme :appearance="appearance">
    <div class="app-layout" :class="{ 'app-layout-fixed': fixedHeight }">
      <AppSidebar />
      <main class="app-main">
        <RouterView />
      </main>
      <button class="theme-toggle" :title="`Switch to ${appearance === 'light' ? 'dark' : 'light'}`" @click="toggleTheme">
        {{ appearance === 'light' ? '☾' : '☀' }}
      </button>
    </div>
  </a-theme>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '#/components/AppSidebar.vue'

const appearance = ref('light')
const toggleTheme = () => {
  appearance.value = appearance.value === 'light' ? 'dark' : 'light'
}

const route = useRoute()
// Editor view (playground + per-demo editor) needs a fixed-height split layout.
// Browse/compare views let the window scroll so components like Affix work.
const fixedHeight = computed(
  () => route.path === '/playground' || !!route.params.demo,
)
</script>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-layout-fixed {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
}

.app-main {
  flex: 1;
  margin-left: 220px;
}

.app-layout-fixed .app-main {
  height: 100vh;
  overflow: hidden;
}

.theme-toggle {
  position: fixed;
  top: 8px;
  right: 12px;
  z-index: 100;
  width: 32px;
  height: 32px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.theme-toggle:hover {
  border-color: #1677ff;
}
</style>

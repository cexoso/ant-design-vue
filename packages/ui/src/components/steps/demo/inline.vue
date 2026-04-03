<template>
  <div style="display: flex; flex-direction: column; gap: 24px">
    <div v-for="(item, index) in data" :key="index" style="display: flex; align-items: center; gap: 16px">
      <div style="min-width: 200px">
        <div style="font-weight: 500">{{ item.title }}</div>
        <div style="font-size: 12px; color: rgba(0, 0, 0, 0.45)">
          Ant Design, a design language for background applications
        </div>
      </div>
      <a-steps
        style="flex: 1"
        type="inline"
        :current="item.current"
        :status="item.status"
        :items="stepItems"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const stepItems = [
  { title: 'Step 1' },
  { title: 'Step 2' },
  { title: 'Step 3' },
]

const data = [
  { title: 'Ant Design Title 1', current: 0 },
  { title: 'Ant Design Title 2', current: 1, status: 'error' as const },
  { title: 'Ant Design Title 3', current: 2 },
  { title: 'Ant Design Title 4', current: 1 },
]
</script>

<template>
  <component :is="contextHolder" />
  <a-button type="primary" @click="info">Display normal message</a-button>
</template>

<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const [messageApi, contextHolder] = message.useMessage();

const info = () => {
  messageApi.info('Hello, Ant Design Vue!');
};
</script>

<template>
  <a-button type="primary" @click="info">Display normal message</a-button>
</template>
<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const info = () => {
  message.info('This is a normal message');
};
</script>

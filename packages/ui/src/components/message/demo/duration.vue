<template>
  <a-button @click="success">Customized display duration</a-button>
</template>
<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const success = () => {
  message.success('This is a prompt message for success, and it will disappear in 10 seconds', 10);
};
</script>

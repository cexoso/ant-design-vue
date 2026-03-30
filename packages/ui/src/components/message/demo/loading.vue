<template>
  <a-button @click="success">Display a loading indicator</a-button>
</template>
<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const success = () => {
  const hide = message.loading('Action in progress..', 0);
  setTimeout(hide, 2500);
};
</script>

<template>
  <a-button @click="success">Customized style</a-button>
</template>
<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const success = () => {
  message.success({
    content: () => 'This is a prompt message with custom className and style',
    class: 'custom-class',
    style: {
      marginTop: '20vh',
    },
  });
};
</script>
<style>
.custom-class {
  color: red;
}
</style>

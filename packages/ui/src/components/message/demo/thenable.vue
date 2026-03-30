<template>
  <a-button @click="success">Display a sequence of message</a-button>
</template>
<script lang="ts" setup>
import { message } from '@ant-design-vue/ui';
const success = () => {
  message
    .loading('Action in progress..', 2.5)
    .then(
      () => message.success('Loading finished', 2.5),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    )
    .then(() => message.info('Loading finished is finished', 2.5));
};
</script>

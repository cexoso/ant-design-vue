<template>
  <div :class="rootClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonGroupProps } from './types'
import { resolveSize } from './types'

defineOptions({ name: 'AButtonGroup' })
const props = defineProps<ButtonGroupProps>()

const rootClass = computed(() => ({
  'ant-btn-group': true,
  [`ant-btn-group-${resolveSize(props.size)}`]: !!props.size,
}))
</script>

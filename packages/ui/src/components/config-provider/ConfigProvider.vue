<template>
  <slot />
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'
import type { ConfigProviderProps, ConfigProviderContext } from './types'
import { configProviderDefaultProps, CONFIG_PROVIDER_KEY } from './types'

defineOptions({ name: 'AConfigProvider' })
const props = withDefaults(defineProps<ConfigProviderProps>(), configProviderDefaultProps)

const context: ConfigProviderContext = {
  size: computed(() => props.size!),
  direction: computed(() => props.direction!),
  disabled: computed(() => props.disabled!),
  getPopupContainer: computed(() => {
    return props.getPopupContainer ?? (() => document.body)
  }),
}

provide(CONFIG_PROVIDER_KEY, context)
</script>

<template>
  <component :is="'style'" v-text="cssContent" />
  <slot />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import type { ThemeProps } from './types'
import { themeDefaultProps } from './types'
import { useThemeProvide } from './hooks'
import { getCssVarColor } from '@/utils/colorAlgorithm'

defineOptions({ name: 'ATheme' })
const props = withDefaults(defineProps<ThemeProps>(), themeDefaultProps)

useThemeProvide(props)

const cssContent = computed(() => {
  const vars = getCssVarColor(props.primaryColor!, {
    appearance: props.appearance! as 'light' | 'dark',
    backgroundColor: props.backgroundColor!,
  })
  return `:root {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
})

// Apply appearance class to documentElement (CSR only)
function applyAppearance(appearance: string) {
  document.documentElement.classList.remove('light-theme', 'dark-theme')
  document.documentElement.classList.add(`${appearance}-theme`)
}

onMounted(() => {
  applyAppearance(props.appearance!)
})

watch(() => props.appearance, (val) => {
  applyAppearance(val!)
})

onUnmounted(() => {
  document.documentElement.classList.remove('light-theme', 'dark-theme')
})
</script>

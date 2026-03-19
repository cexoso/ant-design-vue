<template>
  <component
    :is="tag"
    ref="elRef"
    :class="rootClass"
    :style="cssVars"
    :disabled="isDisabled || undefined"
    :href="href || undefined"
    :target="href ? target : undefined"
    :type="!href ? htmlType : undefined"
    @click="handleClick"
  >
    <Wave :target="elRef" :disabled="isWaveDisabled" />
    <slot name="loading">
      <LoadingOutlined v-if="isLoading" class="ant-btn-icon ant-btn-loading-icon" />
    </slot>
    <slot name="icon" />
    <span v-if="$slots.default" class="ant-btn-content"><slot /></span>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ButtonProps, ButtonEmits, ButtonSlots } from './types'
import { buttonDefaultProps, resolveVariant, resolveSize } from './types'
import { getCssVarColor } from '@/utils/colorAlgorithm'
import { useConfigInject } from '@/hooks'
import { DEFAULT_PRIMARY_COLOR } from '../theme/types'
import LoadingOutlined from '@ant-design/icons-vue/LoadingOutlined'
import { Wave } from '../wave'

defineOptions({ name: 'AButton' })
const props = withDefaults(defineProps<ButtonProps>(), buttonDefaultProps)
const emit = defineEmits<ButtonEmits>()
defineSlots<ButtonSlots>()

const { size: globalSize, disabled: globalDisabled, theme } = useConfigInject()

const elRef = shallowRef<HTMLElement | null>(null)

// --- Loading with delay support ---
const isLoading = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | undefined

function updateLoading() {
  clearTimeout(loadingTimer)
  if (typeof props.loading === 'object' && props.loading.delay > 0) {
    loadingTimer = setTimeout(() => {
      isLoading.value = true
    }, props.loading.delay)
  } else {
    isLoading.value = !!props.loading
  }
}

watch(() => props.loading, updateLoading, { immediate: true })
onBeforeUnmount(() => clearTimeout(loadingTimer))

// --- Resolved props ---
const variant = computed(() => resolveVariant(props))
const size = computed(() => resolveSize(props.size ?? globalSize.value))
const isDisabled = computed(() => props.disabled || globalDisabled.value)
const tag = computed(() => (props.href ? 'a' : 'button'))
const isWaveDisabled = computed(() => {
  const v = variant.value
  return v === 'text' || v === 'link' || isLoading.value || isDisabled.value
})

// --- Color ---
const color = computed(() => {
  if (props.color) return props.color
  if (props.danger) return 'red'
  return theme.primaryColor
})

const cssVars = computed(() => {
  if (color.value.toLowerCase() === DEFAULT_PRIMARY_COLOR.toLowerCase()) return {}
  return getCssVarColor(color.value, {
    appearance: theme.appearance as 'light' | 'dark',
    backgroundColor: theme.backgroundColor,
  })
})

// --- Classes ---
const rootClass = computed(() => ({
  'ant-btn': true,
  [`ant-btn-${variant.value}`]: true,
  [`ant-btn-${size.value}`]: true,
  [`ant-btn-shape-${props.shape}`]: props.shape !== 'default',
  'ant-btn-danger': props.danger,
  'ant-btn-ghost': props.ghost,
  'ant-btn-loading': isLoading.value,
  'ant-btn-disabled': isDisabled.value,
  'ant-btn-block': props.block,
  'ant-btn-custom-color': !!props.color || props.danger,
}))

// --- Events ---
function handleClick(event: MouseEvent) {
  if (isLoading.value || isDisabled.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}

// --- Expose ---
defineExpose({
  focus: (options?: FocusOptions) => elRef.value?.focus(options),
  blur: () => elRef.value?.blur(),
})
</script>

<script setup lang="ts">
import { computed, provide, ref, onBeforeUpdate } from 'vue'
import type { StepsProps, StepsEmits, StepsSlots } from './types'
import { stepsDefaultProps, stepsContextKey } from './types'
import { useConfigInject, useBreakpoint } from '@/hooks'
import Step from './Step.vue'

defineOptions({ name: 'ASteps' })
const props = withDefaults(defineProps<StepsProps>(), stepsDefaultProps)
const emit = defineEmits<StepsEmits>()
defineSlots<StepsSlots>()

const { size: globalSize } = useConfigInject()
const screens = useBreakpoint()

// Steps only supports 'default' | 'small'; ConfigProvider 'md'/'lg' both map to 'default'
const mergedSize = computed(() => props.size ?? (globalSize.value === 'sm' ? 'small' : 'default'))

const mergedDirection = computed(() => {
  if (props.responsive && screens.value.xs) return 'vertical'
  return props.direction
})

const stepCounter = ref(0)

onBeforeUpdate(() => {
  stepCounter.value = 0
})

function handleStepClick(index: number) {
  emit('update:current', index)
  emit('change', index)
}

provide(stepsContextKey, {
  current: computed(() => props.current),
  initial: computed(() => props.initial),
  status: computed(() => props.status),
  size: mergedSize,
  direction: mergedDirection,
  labelPlacement: computed(() => props.labelPlacement),
  percent: computed(() => props.percent),
  progressDot: computed(() => props.progressDot),
  type: computed(() => props.type),
  onStepClick: handleStepClick,
  registerStep: () => {
    return stepCounter.value++
  },
  unregisterStep: () => {
    // No-op: steps are reindexed on each render via counter reset
  },
})

const isInline = computed(() => props.type === 'inline')

const classes = computed(() => ({
  'ant-steps': true,
  [`ant-steps-${mergedDirection.value}`]: true,
  [`ant-steps-${mergedSize.value}`]: mergedSize.value !== 'default',
  'ant-steps-label-vertical':
    props.labelPlacement === 'vertical' && mergedDirection.value === 'horizontal',
  'ant-steps-navigation': props.type === 'navigation',
  'ant-steps-inline': isInline.value,
  'ant-steps-dot': !!props.progressDot && !isInline.value,
}))
</script>

<template>
  <div :class="classes" role="navigation" aria-label="Steps">
    <slot>
      <Step
        v-for="(item, index) in (items || [])"
        :key="index"
        :title="item.title"
        :sub-title="item.subTitle"
        :description="item.description"
        :icon="item.icon"
        :status="item.status"
        :disabled="item.disabled"
      />
    </slot>
  </div>
</template>

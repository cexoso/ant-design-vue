<script setup lang="ts">
import { computed, inject, useSlots } from 'vue'
import CheckOutlined from '@ant-design/icons-vue/CheckOutlined'
import CloseOutlined from '@ant-design/icons-vue/CloseOutlined'
import type { StepProps, StepSlots } from './types'
import { stepsContextKey } from './types'

defineOptions({ name: 'AStep' })
const props = defineProps<StepProps>()
defineSlots<StepSlots>()

const $slots = useSlots()
const context = inject(stepsContextKey, null)

// Register this step and get its index (side-effect: increments parent counter)
const stepIndex = context?.registerStep() ?? 0
const initial = computed(() => context?.initial.value ?? 0)

const currentStatus = computed(() => {
  if (props.status) return props.status
  if (!context) return 'wait'
  const current = context.current.value
  if (stepIndex < current) return 'finish'
  if (stepIndex === current) return context.status.value
  return 'wait'
})

const isClickable = computed(() => {
  return !props.disabled && !!context?.onStepClick
})

function handleClick() {
  if (isClickable.value) {
    context?.onStepClick?.(stepIndex)
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (isClickable.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    context?.onStepClick?.(stepIndex)
  }
}

const hasTitle = computed(() => !!props.title || !!$slots.title)
const hasDescription = computed(() => !!props.description || !!$slots.description)
const hasSubTitle = computed(() => !!props.subTitle || !!$slots.subTitle)
const hasCustomIcon = computed(() => !!props.icon || !!$slots.icon)
const isProgressDot = computed(() => !!context?.progressDot.value)

const isFinish = computed(() => currentStatus.value === 'finish')
const isError = computed(() => currentStatus.value === 'error')
const stepNumber = computed(() => String(stepIndex + initial.value + 1))

const classes = computed(() => ({
  'ant-steps-item': true,
  [`ant-steps-item-${currentStatus.value}`]: true,
  'ant-steps-item-disabled': props.disabled,
  'ant-steps-item-clickable': isClickable.value && !props.disabled,
  'ant-steps-item-custom': hasCustomIcon.value && !isProgressDot.value,
}))

const stepRole = computed(() => (isClickable.value ? 'button' : undefined))
</script>

<template>
  <div
    :class="classes"
    :role="stepRole"
    :tabindex="isClickable && !disabled ? 0 : undefined"
    :aria-current="currentStatus === 'process' ? 'step' : undefined"
    :aria-disabled="disabled || undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="ant-steps-item-container">
      <div class="ant-steps-item-tail" />
      <div class="ant-steps-item-icon">
        <slot name="icon">
          <span v-if="hasCustomIcon && icon" class="ant-steps-icon">
            <component :is="icon" />
          </span>
          <span v-else-if="isProgressDot" class="ant-steps-icon ant-steps-icon-dot" />
          <span v-else class="ant-steps-icon">
            <CheckOutlined v-if="isFinish" />
            <CloseOutlined v-else-if="isError" />
            <template v-else>{{ stepNumber }}</template>
          </span>
        </slot>
      </div>
      <div class="ant-steps-item-content">
        <div v-if="hasTitle" class="ant-steps-item-title">
          <slot name="title">{{ title }}</slot>
          <span v-if="hasSubTitle" class="ant-steps-item-subtitle">
            <slot name="subTitle">{{ subTitle }}</slot>
          </span>
        </div>
        <div v-if="hasDescription" class="ant-steps-item-description">
          <slot name="description">{{ description }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

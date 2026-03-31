<template>
  <Teleport :to="container || 'body'" :disabled="!container">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, watch, onBeforeUnmount } from 'vue'

defineOptions({ name: 'Portal' })

const props = withDefaults(
  defineProps<{
    /** Function, selector, HTMLElement, or false for inline render */
    getContainer?: string | HTMLElement | (() => HTMLElement) | false
    /** Whether the portal content should be rendered */
    visible?: boolean
  }>(),
  {
    visible: true,
  },
)

const container = shallowRef<HTMLElement | null>(null)
let createdContainer: HTMLElement | null = null

function cleanupCreatedContainer() {
  if (createdContainer?.parentNode) {
    createdContainer.parentNode.removeChild(createdContainer)
  }
  createdContainer = null
}

function resolveContainer() {
  if (typeof document === 'undefined') return

  if (props.getContainer === false) {
    cleanupCreatedContainer()
    container.value = null
    return
  }

  if (typeof props.getContainer === 'string') {
    cleanupCreatedContainer()
    container.value = document.querySelector(props.getContainer)
    return
  }

  if (typeof props.getContainer === 'function') {
    cleanupCreatedContainer()
    container.value = props.getContainer() ?? null
    return
  }

  if (props.getContainer instanceof HTMLElement) {
    cleanupCreatedContainer()
    container.value = props.getContainer
    return
  }

  if (!createdContainer) {
    createdContainer = document.createElement('div')
    document.body.appendChild(createdContainer)
  }

  container.value = createdContainer
}

onMounted(() => {
  if (props.visible) {
    resolveContainer()
  }
})

watch(
  () => props.visible,
  (val) => {
    if (val && !container.value) {
      resolveContainer()
    }
  },
)

watch(
  () => props.getContainer,
  () => {
    resolveContainer()
  },
)

onBeforeUnmount(() => {
  cleanupCreatedContainer()
})
</script>

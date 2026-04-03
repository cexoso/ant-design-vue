<template>
  <Teleport :to="container || 'body'" :disabled="!container">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'

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
const pendingCleanupContainers = new Set<HTMLElement>()

function removeContainer(target: HTMLElement | null) {
  if (target?.parentNode) {
    target.parentNode.removeChild(target)
  }
}

function cleanupCreatedContainer(target: HTMLElement | null = createdContainer) {
  if (!target) {
    return
  }

  pendingCleanupContainers.delete(target)
  removeContainer(target)

  if (createdContainer === target) {
    createdContainer = null
  }
}

function releaseCreatedContainer() {
  const target = createdContainer
  createdContainer = null
  return target
}

function scheduleCreatedContainerCleanup(target: HTMLElement | null) {
  if (!target) {
    return
  }

  pendingCleanupContainers.add(target)

  nextTick(() => {
    if (!pendingCleanupContainers.has(target)) {
      return
    }

    if (container.value === target || createdContainer === target) {
      pendingCleanupContainers.delete(target)
      return
    }

    pendingCleanupContainers.delete(target)
    removeContainer(target)
  })
}

function ensureCreatedContainer() {
  if (!createdContainer) {
    createdContainer = document.createElement('div')
    document.body.appendChild(createdContainer)
  }

  return createdContainer
}

function resolveContainerTarget() {
  if (typeof props.getContainer === 'string') {
    try {
      const matchedContainer = document.querySelector(props.getContainer)
      return matchedContainer instanceof HTMLElement ? matchedContainer : null
    } catch {
      return null
    }
  }

  if (typeof props.getContainer === 'function') {
    const resolvedContainer = props.getContainer()
    return resolvedContainer instanceof HTMLElement ? resolvedContainer : null
  }

  if (props.getContainer instanceof HTMLElement) {
    return props.getContainer
  }

  return null
}

function resolveContainer() {
  if (typeof document === 'undefined') return

  if (props.getContainer === false) {
    container.value = null
    scheduleCreatedContainerCleanup(releaseCreatedContainer())
    return
  }

  const resolvedContainer = resolveContainerTarget()

  if (resolvedContainer) {
    container.value = resolvedContainer
    scheduleCreatedContainerCleanup(releaseCreatedContainer())
    return
  }

  container.value = ensureCreatedContainer()
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
    if (!props.visible && !container.value) {
      return
    }

    resolveContainer()
  },
)

onBeforeUnmount(() => {
  cleanupCreatedContainer()
  pendingCleanupContainers.forEach(target => removeContainer(target))
  pendingCleanupContainers.clear()
})
</script>

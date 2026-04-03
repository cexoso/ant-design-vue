<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import {
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { Portal } from '@/_internal/portal'
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'

defineOptions({ name: 'AImagePreview' })

const props = withDefaults(
  defineProps<{
    open?: boolean
    src?: string
    srcs?: string[]
    currentIndex?: number
    getContainer?: () => HTMLElement
  }>(),
  {
    open: false,
    currentIndex: 0,
  },
)

const emit = defineEmits<{
  (e: 'update:open', open: boolean): void
  (e: 'update:currentIndex', index: number): void
}>()

const MIN_SCALE = 0.25
const MAX_SCALE = 10
const SCALE_STEP = 0.5

const scale = ref(1)
const rotate = ref(0)
const activeIndex = ref(props.currentIndex)
let isBodyScrollLocked = false

const currentSrc = computed(() => {
  if (props.srcs && props.srcs.length > 0) {
    return props.srcs[activeIndex.value] || ''
  }
  return props.src || ''
})

const hasMultiple = computed(() => {
  return props.srcs != null && props.srcs.length > 1
})

const transformStyle = computed(() => ({
  transform: `scale(${scale.value}) rotate(${rotate.value}deg)`,
}))

watch(
  () => props.open,
  (val) => {
    if (val) {
      // Reset transform on open
      scale.value = 1
      rotate.value = 0
    }
  },
)

watch(
  () => props.currentIndex,
  (val) => {
    activeIndex.value = val
  },
)

function setBodyScrollLock(locked: boolean) {
  if (locked) {
    if (!isBodyScrollLocked) {
      lockBodyScroll()
      isBodyScrollLocked = true
    }
    return
  }

  if (isBodyScrollLocked) {
    unlockBodyScroll()
    isBodyScrollLocked = false
  }
}

watch(() => props.open, open => setBodyScrollLock(open), { immediate: true })

onBeforeUnmount(() => {
  setBodyScrollLock(false)
})

function close() {
  emit('update:open', false)
}

function zoomIn() {
  scale.value = Math.min(MAX_SCALE, scale.value + SCALE_STEP)
}

function zoomOut() {
  scale.value = Math.max(MIN_SCALE, scale.value - SCALE_STEP)
}

function rotateLeft() {
  rotate.value -= 90
}

function rotateRight() {
  rotate.value += 90
}

function goPrev() {
  if (!props.srcs) return
  const next = (activeIndex.value - 1 + props.srcs.length) % props.srcs.length
  activeIndex.value = next
  emit('update:currentIndex', next)
  scale.value = 1
  rotate.value = 0
}

function goNext() {
  if (!props.srcs) return
  const next = (activeIndex.value + 1) % props.srcs.length
  activeIndex.value = next
  emit('update:currentIndex', next)
  scale.value = 1
  rotate.value = 0
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
  } else if (e.key === '+' || e.key === '=') {
    zoomIn()
  } else if (e.key === '-') {
    zoomOut()
  } else if (e.key === 'ArrowLeft' && hasMultiple.value) {
    goPrev()
  } else if (e.key === 'ArrowRight' && hasMultiple.value) {
    goNext()
  }
}

function onMaskClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    close()
  }
}
</script>

<template>
  <Portal :visible="open" :get-container="getContainer">
    <!-- Mask -->
    <Transition name="ant-fade">
      <div v-if="open" class="ant-image-preview-mask" />
    </Transition>

    <!-- Preview wrap -->
    <Transition name="ant-zoom">
      <div
        v-if="open"
        class="ant-image-preview-wrap"
        tabindex="-1"
        @keydown="onKeydown"
        @click="onMaskClick"
      >
        <div class="ant-image-preview-body">
          <!-- Close -->
          <button
            type="button"
            class="ant-image-preview-close"
            aria-label="Close preview"
            @click="close"
          >
            <CloseOutlined />
          </button>

          <!-- Navigation arrows -->
          <template v-if="hasMultiple">
            <button
              type="button"
              class="ant-image-preview-switch-left"
              aria-label="Previous image"
              @click="goPrev"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              class="ant-image-preview-switch-right"
              aria-label="Next image"
              @click="goNext"
            >
              <RightOutlined />
            </button>
          </template>

          <!-- Image -->
          <div class="ant-image-preview-img-wrapper">
            <img
              class="ant-image-preview-img"
              :src="currentSrc"
              :style="transformStyle"
              alt="Preview"
              @click.stop
            />
          </div>

          <!-- Toolbar -->
          <div class="ant-image-preview-operations">
            <button
              type="button"
              class="ant-image-preview-operations-btn"
              aria-label="Zoom in"
              @click="zoomIn"
            >
              <ZoomInOutlined />
            </button>
            <button
              type="button"
              class="ant-image-preview-operations-btn"
              aria-label="Zoom out"
              @click="zoomOut"
            >
              <ZoomOutOutlined />
            </button>
            <button
              type="button"
              class="ant-image-preview-operations-btn"
              aria-label="Rotate left"
              @click="rotateLeft"
            >
              <RotateLeftOutlined />
            </button>
            <button
              type="button"
              class="ant-image-preview-operations-btn"
              aria-label="Rotate right"
              @click="rotateRight"
            >
              <RotateRightOutlined />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Portal>
</template>

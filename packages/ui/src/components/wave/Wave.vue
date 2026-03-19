<template>
  <div v-if="visible && !disabled" ref="divRef" style="position: absolute; left: 0; top: 0">
    <Transition
      appear
      name="ant-wave-motion"
      appearFromClass="ant-wave-motion-appear"
      appearActiveClass="ant-wave-motion-appear"
      appearToClass="ant-wave-motion-appear ant-wave-motion-appear-active"
    >
      <div
        v-if="visible"
        :style="waveStyle"
        class="ant-wave-motion"
        @transitionend="onTransitionend"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import wrapperRaf from '@/utils/raf'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  Transition,
  watch,
} from 'vue'
import { getTargetWaveColor } from './util'
import isVisible from '@/utils/isVisible'

const props = defineProps<{
  disabled?: boolean
  target: HTMLElement | null
}>()

const divRef = shallowRef<HTMLDivElement | null>(null)
const visible = ref(false)

const color = ref<string | null>(null)
const borderRadius = ref<number[]>([])
const left = ref(0)
const top = ref(0)
const width = ref(0)
const height = ref(0)

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value
}

function syncPos() {
  const { target } = props
  if (!target) return
  const nodeStyle = getComputedStyle(target)

  color.value = getTargetWaveColor(target)

  const isStatic = nodeStyle.position === 'static'
  const { borderLeftWidth, borderTopWidth } = nodeStyle

  left.value = isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth))
  top.value = isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth))
  width.value = target.offsetWidth
  height.value = target.offsetHeight

  const {
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomLeftRadius,
    borderBottomRightRadius,
  } = nodeStyle

  borderRadius.value = [
    borderTopLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    borderBottomLeftRadius,
  ].map(radius => validateNum(parseFloat(radius)))
}

let resizeObserver: ResizeObserver | undefined
let rafId: number
let timeoutId: ReturnType<typeof setTimeout> | undefined
let onClick: ((e: MouseEvent) => void) | undefined

function clear() {
  clearTimeout(timeoutId)
  wrapperRaf.cancel(rafId)
  resizeObserver?.disconnect()
  if (onClick && props.target) {
    props.target.removeEventListener('click', onClick, true)
  }
}

function init() {
  clear()
  const { target } = props
  if (!target || target.nodeType !== 1) return

  onClick = (e: MouseEvent) => {
    if (
      (e.target as HTMLElement).tagName === 'INPUT' ||
      !isVisible(e.target as HTMLElement) ||
      !target.getAttribute ||
      target.getAttribute('disabled') ||
      (target as HTMLInputElement).disabled ||
      target.className.includes('disabled') ||
      target.className.includes('-leave')
    ) {
      return
    }
    visible.value = false
    nextTick(() => {
      visible.value = true
    })
  }

  target.addEventListener('click', onClick, true)

  rafId = wrapperRaf(() => {
    syncPos()
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(syncPos)
    resizeObserver.observe(target)
  }
}

onMounted(() => {
  nextTick(() => init())
})

watch(() => props.target, () => init(), { flush: 'post' })

onBeforeUnmount(() => {
  clear()
})

function onTransitionend(e: TransitionEvent) {
  if (e.propertyName === 'opacity') {
    visible.value = false
  }
}

// Auto-hide after 5s as fallback
watch(visible, (val) => {
  clearTimeout(timeoutId)
  if (val) {
    timeoutId = setTimeout(() => {
      visible.value = false
    }, 5000)
  }
})

const waveStyle = computed(() => {
  const style: Record<string, string> = {
    left: `${left.value}px`,
    top: `${top.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`,
    borderRadius: borderRadius.value.map(radius => `${radius}px`).join(' '),
  }
  if (color.value) {
    style['--wave-color'] = color.value
  }
  return style
})
</script>

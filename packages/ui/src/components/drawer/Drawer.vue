<template>
  <Portal :visible="shouldRender" :get-container="resolvedGetContainer">
    <div v-if="shouldRender" :class="rootClasses" :style="props.rootStyle">
      <!-- Mask -->
      <Transition name="ant-fade">
        <div
          v-if="props.mask && shouldRender"
          v-show="motionOpen"
          class="ant-drawer-mask"
          :style="maskStyle"
          @click="onMaskClick"
        />
      </Transition>

      <!-- Drawer -->
      <Transition :name="transitionName" @after-enter="onAfterOpen" @after-leave="onAfterClose">
        <div
          v-if="shouldRender"
          v-show="motionOpen"
          :class="contentWrapperClasses"
          :style="contentWrapperStyle"
        >
          <div
            ref="drawerRef"
            v-bind="panelAttrs"
            :class="drawerClasses"
            :style="drawerStyle"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="hasTitle ? titleId : undefined"
            tabindex="-1"
            @keydown="onKeydown"
          >
            <!-- Header -->
            <div v-if="hasHeader" class="ant-drawer-header" :style="props.headerStyle">
              <div class="ant-drawer-header-title">
                <button
                  v-if="props.closable"
                  type="button"
                  class="ant-drawer-close"
                  aria-label="Close"
                  @click="onClose"
                >
                  <slot name="closeIcon">
                    <component :is="props.closeIcon" v-if="isTemplateRenderable(props.closeIcon)" />
                    <template v-else-if="props.closeIcon !== undefined && props.closeIcon !== null">
                      {{ props.closeIcon }}
                    </template>
                    <CloseOutlined v-else />
                  </slot>
                </button>
                <div v-if="hasTitle" :id="titleId" class="ant-drawer-title">
                  <slot name="title">
                    <component :is="props.title" v-if="isTemplateRenderable(props.title)" />
                    <template v-else>{{ props.title }}</template>
                  </slot>
                </div>
              </div>
              <div v-if="hasExtra" class="ant-drawer-extra">
                <slot name="extra">
                  <component :is="props.extra" v-if="isTemplateRenderable(props.extra)" />
                  <template v-else>{{ props.extra }}</template>
                </slot>
              </div>
            </div>

            <!-- Body -->
            <div class="ant-drawer-body" :style="props.bodyStyle">
              <RenderVNodes :nodes="decoratedBodyContent" />
            </div>

            <!-- Footer -->
            <div v-if="hasFooter" class="ant-drawer-footer" :style="props.footerStyle">
              <slot name="footer">
                <component :is="props.footer" v-if="isTemplateRenderable(props.footer)" />
                <template v-else>{{ props.footer }}</template>
              </slot>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Portal>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  useAttrs,
  useSlots,
  onBeforeUnmount,
  nextTick,
  getCurrentInstance,
  isVNode,
  defineComponent,
  cloneVNode,
} from 'vue'
import type { CSSProperties } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Portal } from '@/_internal/portal'
import type { DrawerProps, DrawerEmits, DrawerSlots } from './types'
import { drawerDefaultProps } from './types'

type BodyScrollStyleSnapshot = {
  overflow: string
  overflowX: string
  overflowY: string
  paddingRight: string
  width: string
}

const RenderVNodes = defineComponent({
  name: 'DrawerRenderVNodes',
  props: ['nodes'],
  setup(renderProps) {
    return () => renderProps.nodes as any
  },
})

const defaultPushDistance = 180
const defaultDrawerZIndex = 1000
const nestedDrawerZIndexOffset = 10

let bodyScrollLockCount = 0
const bodyScrollOriginStyle: BodyScrollStyleSnapshot = {
  overflow: '',
  overflowX: '',
  overflowY: '',
  paddingRight: '',
  width: '',
}

function applyBodyScrollStyle(style: BodyScrollStyleSnapshot) {
  document.body.style.overflow = style.overflow
  document.body.style.overflowX = style.overflowX
  document.body.style.overflowY = style.overflowY
  document.body.style.paddingRight = style.paddingRight
  document.body.style.width = style.width
}

function captureBodyScrollStyle() {
  bodyScrollOriginStyle.overflow = document.body.style.overflow
  bodyScrollOriginStyle.overflowX = document.body.style.overflowX
  bodyScrollOriginStyle.overflowY = document.body.style.overflowY
  bodyScrollOriginStyle.paddingRight = document.body.style.paddingRight
  bodyScrollOriginStyle.width = document.body.style.width
}

function clearBodyScrollStyleSnapshot() {
  bodyScrollOriginStyle.overflow = ''
  bodyScrollOriginStyle.overflowX = ''
  bodyScrollOriginStyle.overflowY = ''
  bodyScrollOriginStyle.paddingRight = ''
  bodyScrollOriginStyle.width = ''
}

function lockBodyScroll() {
  if (typeof document === 'undefined') return

  if (bodyScrollLockCount === 0) {
    captureBodyScrollStyle()

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
    applyBodyScrollStyle({
      overflow: 'hidden',
      overflowX: 'hidden',
      overflowY: 'hidden',
      paddingRight: bodyScrollOriginStyle.paddingRight,
      width: scrollBarWidth > 0 ? `calc(100% - ${scrollBarWidth}px)` : bodyScrollOriginStyle.width,
    })
  }

  bodyScrollLockCount += 1
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || bodyScrollLockCount === 0) return

  bodyScrollLockCount -= 1

  if (bodyScrollLockCount === 0) {
    applyBodyScrollStyle(bodyScrollOriginStyle)
    clearBodyScrollStyleSnapshot()
  }
}

defineOptions({ name: 'ADrawer', inheritAttrs: false })

const props = withDefaults(defineProps<DrawerProps>(), drawerDefaultProps)
const emit = defineEmits<DrawerEmits>()
defineSlots<DrawerSlots>()
const attrs = useAttrs()
const slots = useSlots()

const instance = getCurrentInstance()!

const drawerRef = ref<HTMLElement | null>(null)
const hasNotifiedParentDrawer = ref(false)
const pushedChildrenCount = ref(0)

// --- Open state ---
const titleId = `ant-drawer-title-${instance.uid}`
const rawProps = computed(() => instance.vnode.props || {})

function hasExplicitProp(propName: string, kebabName?: string) {
  return propName in rawProps.value || (!!kebabName && kebabName in rawProps.value)
}

const controlledOpenProp = computed<'open' | 'visible' | undefined>(() => {
  if ('open' in rawProps.value) return 'open'
  if ('visible' in rawProps.value) return 'visible'
  return undefined
})
const isControlled = computed(() => controlledOpenProp.value !== undefined)
const resolvedGetContainer = computed(() => {
  return hasExplicitProp('getContainer', 'get-container') ? props.getContainer : undefined
})
const resolvedPush = computed(() => {
  return hasExplicitProp('push') ? props.push : true
})
const isInline = computed(() => resolvedGetContainer.value === false)
const internalOpen = ref(false)
const mergedOpen = computed(() => {
  if (controlledOpenProp.value === 'open') return props.open
  if (controlledOpenProp.value === 'visible') return props.visible
  return internalOpen.value
})

const hasBeenOpened = ref(mergedOpen.value)
const motionOpen = ref(false)
const shouldRender = computed(() => {
  if (props.destroyOnClose) return mergedOpen.value
  if (props.forceRender) return true
  return hasBeenOpened.value
})

watch(mergedOpen, (val) => {
  if (val) hasBeenOpened.value = true
})

watch(
  [mergedOpen, shouldRender],
  ([open, render]) => {
    if (!render || !open) {
      motionOpen.value = false
      return
    }

    nextTick(() => {
      if (mergedOpen.value && shouldRender.value) {
        motionOpen.value = true
      }
    })
  },
  { immediate: true },
)

watch(
  motionOpen,
  open => {
    if (!props.__parentDrawerToggle) {
      return
    }

    if (open) {
      if (!hasNotifiedParentDrawer.value) {
        props.__parentDrawerToggle(true)
        hasNotifiedParentDrawer.value = true
      }
      return
    }

    if (hasNotifiedParentDrawer.value) {
      props.__parentDrawerToggle(false)
      hasNotifiedParentDrawer.value = false
    }
  },
  { flush: 'post' },
)

watch(
  () => props.__parentDrawerOpen,
  parentOpen => {
    if (parentOpen === false && mergedOpen.value) {
      setOpen(false)
    }
  },
  { flush: 'post' },
)

// --- Focus management ---
let previousActiveElement: HTMLElement | null = null
let isBodyScrollLocked = false
const shouldLockBodyScroll = computed(() => mergedOpen.value && !isInline.value && props.mask)

watch(
  mergedOpen,
  (val) => {
    if (!props.autofocus) return
    if (val) {
      nextTick(() => {
        previousActiveElement = document.activeElement as HTMLElement
        drawerRef.value?.focus()
      })
      return
    }
    nextTick(() => {
      previousActiveElement?.focus()
      previousActiveElement = null
    })
  },
  { immediate: true },
)

// --- Lock body scroll ---
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

watch(shouldLockBodyScroll, locked => setBodyScrollLock(locked), { immediate: true })

onBeforeUnmount(() => {
  setBodyScrollLock(false)

  if (hasNotifiedParentDrawer.value) {
    props.__parentDrawerToggle?.(false)
    hasNotifiedParentDrawer.value = false
  }
})

// --- Computed ---
function hasRenderableContent(value: unknown) {
  return value !== undefined && value !== null && value !== false && value !== ''
}

function isTemplateRenderable(value: unknown) {
  return typeof value === 'function' || isVNode(value)
}

function toCssSize(value: string | number) {
  if (typeof value === 'number') {
    return `${value}px`
  }

  const normalizedValue = value.trim()

  if (/^-?\d+(\.\d+)?$/.test(normalizedValue)) {
    return `${normalizedValue}px`
  }

  return value
}

function toPushDistance(value: string | number) {
  return `${parseFloat(String(value || 0))}px`
}

function decorateNestedDrawerNode(value: unknown): unknown {
  if (!isVNode(value)) {
    return value
  }

  const type = value.type as { name?: string; __name?: string } | null
  const typeName = type?.name || type?.__name
  const vnodeProps = value.props as Record<string, unknown> | null
  const looksLikeDrawer =
    !!vnodeProps &&
    ('open' in vnodeProps || 'visible' in vnodeProps) &&
    ('placement' in vnodeProps ||
      'closable' in vnodeProps ||
      'maskClosable' in vnodeProps ||
      'getContainer' in vnodeProps ||
      'width' in vnodeProps ||
      'height' in vnodeProps)

  if (value.type === instance.type || typeName === 'ADrawer' || typeName === 'Drawer' || looksLikeDrawer) {
    return cloneVNode(value, {
      __parentDrawerToggle: onNestedDrawerToggle,
      __parentDrawerOpen: mergedOpen.value,
      __parentDrawerZIndex: resolvedZIndex.value + nestedDrawerZIndexOffset,
    })
  }

  return value
}

const hasTitle = computed(() => !!slots.title || hasRenderableContent(props.title))
const hasExtra = computed(() => !!slots.extra || hasRenderableContent(props.extra))
const hasFooter = computed(() => !!slots.footer || hasRenderableContent(props.footer))
const hasHeader = computed(() => hasTitle.value || hasExtra.value || props.closable)

function onNestedDrawerToggle(open: boolean) {
  pushedChildrenCount.value = Math.max(0, pushedChildrenCount.value + (open ? 1 : -1))
}

const decoratedBodyContent = computed(() => {
  return (slots.default?.() ?? []).map(decorateNestedDrawerNode)
})

const sizeWidthMap = { default: 378, large: 736 }
const sizeHeightMap = { default: 378, large: 736 }

const resolvedWidth = computed(() => {
  if (props.width != null) return props.width
  return sizeWidthMap[props.size!]
})

const resolvedHeight = computed(() => {
  if (props.height != null) return props.height
  return sizeHeightMap[props.size!]
})

const transitionName = computed(() => {
  const map: Record<string, string> = {
    right: 'ant-slide-right',
    left: 'ant-slide-left',
    top: 'ant-slide-top',
    bottom: 'ant-slide-bottom',
  }
  return map[props.placement!]
})

const rootClasses = computed(() => [
  'ant-drawer-root',
  { 'ant-drawer-inline': isInline.value },
  props.rootClassName,
])

const panelAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const contentWrapperClasses = computed(() => [
  'ant-drawer-content-wrapper',
  `ant-drawer-content-wrapper-${props.placement}`,
])

const drawerClasses = computed(() => [
  'ant-drawer',
  `ant-drawer-${props.placement}`,
  attrs.class,
])

const resolvedZIndex = computed(() => {
  return props.zIndex ?? props.__parentDrawerZIndex ?? defaultDrawerZIndex
})

const overlayStyle = computed<CSSProperties>(() => {
  return { zIndex: resolvedZIndex.value }
})

const isHorizontalPlacement = computed(() => {
  return props.placement === 'left' || props.placement === 'right'
})

const hasActiveNestedDrawer = computed(() => pushedChildrenCount.value > 0)
const inactiveMaskStyle: CSSProperties = { pointerEvents: 'none' }
const isPushed = computed(() => pushedChildrenCount.value > 0 && resolvedPush.value !== false)

const pushTransformStyle = computed<CSSProperties>(() => {
  if (!isPushed.value) {
    return {}
  }

  const push = resolvedPush.value
  const distance =
    typeof push === 'object' && push !== null
      ? toPushDistance(push.distance)
      : toPushDistance(defaultPushDistance)

  switch (props.placement) {
    case 'left':
      return { transform: `translateX(${distance})` }
    case 'right':
      return { transform: `translateX(-${distance})` }
    case 'top':
      return { transform: `translateY(${distance})` }
    case 'bottom':
      return { transform: `translateY(-${distance})` }
    default:
      return {}
  }
})

const contentWrapperStyle = computed(() => {
  const style: CSSProperties = { ...overlayStyle.value, ...pushTransformStyle.value }
  if (isHorizontalPlacement.value) {
    style.width = toCssSize(resolvedWidth.value)
  } else {
    style.height = toCssSize(resolvedHeight.value)
  }
  return style
})

const drawerStyle = computed(() => {
  const style: CSSProperties = {}
  if (isHorizontalPlacement.value) {
    style.width = toCssSize(resolvedWidth.value)
  } else {
    style.height = toCssSize(resolvedHeight.value)
  }
  return [style, props.drawerStyle, attrs.style]
})

const maskStyle = computed(() => {
  return [overlayStyle.value, hasActiveNestedDrawer.value ? inactiveMaskStyle : null, props.maskStyle]
})

// --- Handlers ---
function setOpen(open: boolean) {
  if (!isControlled.value) {
    internalOpen.value = open
  }
  emit('update:open', open)
  emit('update:visible', open)
}

function onClose(e?: MouseEvent | KeyboardEvent) {
  emit('close', e as MouseEvent | KeyboardEvent)
  setOpen(false)
}

function onMaskClick(e: MouseEvent) {
  if (props.maskClosable) {
    e.stopPropagation()
    onClose(e)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (props.keyboard && e.key === 'Escape') {
    e.stopPropagation()
    onClose(e)
  }
}

function onAfterOpen() {
  emit('afterOpenChange', true)
  emit('afterVisibleChange', true)
  props.afterOpenChange?.(true)
  props.afterVisibleChange?.(true)
}

function onAfterClose() {
  emit('afterOpenChange', false)
  emit('afterVisibleChange', false)
  props.afterOpenChange?.(false)
  props.afterVisibleChange?.(false)
  if (props.destroyOnClose) {
    hasBeenOpened.value = false
  }
}
</script>

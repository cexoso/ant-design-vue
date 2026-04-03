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
                    <RenderContent v-if="hasCustomCloseIcon" :content="resolvedCloseIconContent" />
                    <CloseOutlined v-else />
                  </slot>
                </button>
                <div v-if="hasTitle" :id="titleId" class="ant-drawer-title">
                  <slot name="title">
                    <RenderContent :content="resolvedTitleContent" />
                  </slot>
                </div>
              </div>
              <div v-if="hasExtra" class="ant-drawer-extra">
                <slot name="extra">
                  <RenderContent :content="resolvedExtraContent" />
                </slot>
              </div>
            </div>

            <!-- Body -->
            <div class="ant-drawer-body" :style="props.bodyStyle">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="hasFooter" class="ant-drawer-footer" :style="props.footerStyle">
              <slot name="footer">
                <RenderContent :content="resolvedFooterContent" />
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
  shallowRef,
  computed,
  watch,
  provide,
  inject,
  useAttrs,
  useSlots,
  onBeforeUpdate,
  onBeforeUnmount,
  nextTick,
  getCurrentInstance,
  defineComponent,
} from 'vue'
import type { CSSProperties } from 'vue'
import { CloseOutlined } from '@ant-design/icons-vue'
import { Portal } from '@/_internal/portal'
import { lockBodyScroll, unlockBodyScroll } from '../../utils/bodyScrollLock'
import type { DrawerProps, DrawerEmits, DrawerSlots } from './types'
import { drawerContextKey, drawerDefaultProps } from './types'

const RenderContent = defineComponent({
  name: 'DrawerRenderContent',
  props: ['content'],
  setup(renderProps) {
    return () => {
      const content = renderProps.content
      return typeof content === 'function' ? content() : (content as any)
    }
  },
})

const defaultPushDistance = 180
const defaultDrawerZIndex = 1000
const nestedDrawerZIndexOffset = 10

defineOptions({ name: 'ADrawer', inheritAttrs: false })

const props = withDefaults(defineProps<DrawerProps>(), drawerDefaultProps)
const emit = defineEmits<DrawerEmits>()
defineSlots<DrawerSlots>()
const attrs = useAttrs()
const slots = useSlots()

const instance = getCurrentInstance()!
const parentDrawerContext = inject(drawerContextKey, null)

const drawerRef = ref<HTMLElement | null>(null)
const hasNotifiedParentDrawer = ref(false)
const pushedChildrenCount = ref(0)

// --- Open state ---
const titleId = `ant-drawer-title-${instance.uid}`
const rawProps = shallowRef<Record<string, unknown>>((instance.vnode.props || {}) as Record<string, unknown>)

function syncRawProps() {
  rawProps.value = (instance.vnode.props || {}) as Record<string, unknown>
}

onBeforeUpdate(syncRawProps)

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
  if (controlledOpenProp.value === 'open') return props.open ?? false
  if (controlledOpenProp.value === 'visible') return props.visible ?? false
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
    if (!parentDrawerContext) {
      return
    }

    if (open) {
      if (!hasNotifiedParentDrawer.value) {
        parentDrawerContext.onNestedDrawerToggle(true)
        hasNotifiedParentDrawer.value = true
      }
      return
    }

    if (hasNotifiedParentDrawer.value) {
      parentDrawerContext.onNestedDrawerToggle(false)
      hasNotifiedParentDrawer.value = false
    }
  },
  { flush: 'post' },
)

watch(
  () => parentDrawerContext?.open.value,
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
    if (typeof document === 'undefined') return

    if (val) {
      nextTick(() => {
        if (typeof document === 'undefined') return
        previousActiveElement = document.activeElement as HTMLElement
        drawerRef.value?.focus()
      })
      return
    }

    nextTick(() => {
      if (typeof document === 'undefined') return
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
    parentDrawerContext?.onNestedDrawerToggle(false)
    hasNotifiedParentDrawer.value = false
  }
})

// --- Computed ---
function hasRenderableContent(value: unknown) {
  return value !== undefined && value !== null && value !== false && value !== ''
}

function resolveRenderableContent(value: unknown) {
  return typeof value === 'function' ? value() : value
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


const resolvedTitleContent = computed(() => resolveRenderableContent(props.title))
const resolvedExtraContent = computed(() => resolveRenderableContent(props.extra))
const resolvedFooterContent = computed(() => resolveRenderableContent(props.footer))
const resolvedCloseIconContent = computed(() => resolveRenderableContent(props.closeIcon))
const hasCustomCloseIcon = computed(() => hasRenderableContent(resolvedCloseIconContent.value))
const hasTitle = computed(() => !!slots.title || hasRenderableContent(resolvedTitleContent.value))
const hasExtra = computed(() => !!slots.extra || hasRenderableContent(resolvedExtraContent.value))
// Vue may normalize an omitted `footer` prop to false, so raw vnode props decide explicit disablement.
const showFooter = computed(() => {
  if ('footer' in rawProps.value) {
    return props.footer !== false && props.footer !== null
  }
  return true
})
const hasFooter = computed(
  () => showFooter.value && (!!slots.footer || hasRenderableContent(resolvedFooterContent.value)),
)
const hasHeader = computed(() => hasTitle.value || hasExtra.value || props.closable)

function onNestedDrawerToggle(open: boolean) {
  pushedChildrenCount.value = Math.max(0, pushedChildrenCount.value + (open ? 1 : -1))
}

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
  return props.zIndex ?? (parentDrawerContext ? parentDrawerContext.zIndex.value + nestedDrawerZIndexOffset : defaultDrawerZIndex)
})

provide(drawerContextKey, {
  open: mergedOpen,
  zIndex: resolvedZIndex,
  onNestedDrawerToggle,
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
      ? toCssSize(push.distance)
      : toCssSize(defaultPushDistance)

  let transform = ''

  switch (props.placement) {
    case 'left':
      transform = `translateX(${distance})`
      break
    case 'right':
      transform = `translateX(-${distance})`
      break
    case 'top':
      transform = `translateY(${distance})`
      break
    case 'bottom':
      transform = `translateY(-${distance})`
      break
  }

  return transform
    ? ({ '--ant-drawer-push-transform': transform, '--ant-drawer-push-distance': distance } as CSSProperties)
    : {}
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
  return [overlayStyle.value, props.maskStyle, hasActiveNestedDrawer.value ? inactiveMaskStyle : null]
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

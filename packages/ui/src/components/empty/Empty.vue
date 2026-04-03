<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { CSSProperties, VNode } from 'vue'
import { useConfigInject } from '@/hooks/useConfigInject'
import { type EmptyImageComponent, type EmptySlots } from './types'
import DefaultEmpty from './DefaultEmpty.vue'

defineOptions({ name: 'AEmpty' })

const props = withDefaults(
  defineProps<{
    /** Custom description text; pass false to hide */
    description?: string | false
    /** Custom image (as URL string or built-in Empty image component) */
    image?: string | EmptyImageComponent
    /** Image style override */
    imageStyle?: CSSProperties
  }>(),
  { description: undefined },
)

const slots = useSlots()
defineSlots<EmptySlots>()
const { locale } = useConfigInject()

function getImageVariant(image?: string | EmptyImageComponent, imageSlot?: VNode[]) {
  if (typeof image === 'string') return 'custom'
  if (image?.PRESENTED_IMAGE_SIMPLE) return 'simple'
  if (image?.PRESENTED_IMAGE_DEFAULT) return 'default'

  const firstNode = imageSlot?.[0]
  const imageType =
    firstNode && (typeof firstNode.type === 'object' || typeof firstNode.type === 'function')
      ? (firstNode.type as EmptyImageComponent)
      : undefined

  if (imageType?.PRESENTED_IMAGE_SIMPLE) return 'simple'
  if (imageType?.PRESENTED_IMAGE_DEFAULT) return 'default'
  if (imageSlot?.length) return 'custom'
  return 'default'
}

const imageSlot = computed(() => (props.image === undefined ? slots.image?.() : undefined))
const imageVariant = computed(() => getImageVariant(props.image, imageSlot.value))
const emptyClass = computed(() => ({
  'ant-empty-normal': imageVariant.value === 'simple',
  'ant-empty-small': imageVariant.value === 'simple',
}))
const showDescription = computed(() => {
  if (props.description !== undefined) return props.description !== false
  return true
})
const descriptionText = computed(() =>
  typeof props.description === 'string'
    ? props.description
    : locale.value.Empty?.description ?? 'No data',
)
</script>

<template>
  <div class="ant-empty" :class="emptyClass" role="status">
    <div class="ant-empty-image" :style="imageStyle" aria-hidden="true">
      <img v-if="typeof image === 'string'" :src="image" :alt="typeof descriptionText === 'string' ? descriptionText : 'empty'" />
      <component :is="image" v-else-if="image" />
      <slot v-else name="image">
        <DefaultEmpty />
      </slot>
    </div>
    <div v-if="showDescription" class="ant-empty-description">
      <template v-if="description !== undefined">
        {{ descriptionText }}
      </template>
      <slot v-else name="description">{{ descriptionText }}</slot>
    </div>
    <div v-if="$slots.default" class="ant-empty-footer">
      <slot />
    </div>
  </div>
</template>

import type { CSSProperties, ComputedRef, InjectionKey } from 'vue'
import type { Slot, SlotReturnType } from '@/utils/types'

export type DrawerPlacement = 'top' | 'right' | 'bottom' | 'left'
export type DrawerGetContainer = string | HTMLElement | (() => HTMLElement) | false
export type DrawerRenderContent = Exclude<SlotReturnType, boolean> | (() => Exclude<SlotReturnType, boolean>)
export type DrawerPush = boolean | { distance: string | number }

export interface DrawerContext {
  open: ComputedRef<boolean>
  zIndex: ComputedRef<number>
  onNestedDrawerToggle: (open: boolean) => void
}

export const drawerContextKey: InjectionKey<DrawerContext> = Symbol('drawerContext')

export interface DrawerProps {
  /** Whether the drawer is visible (v-model:open) */
  open?: boolean
  /** @deprecated Use `open` instead */
  visible?: boolean
  /** Whether the drawer should receive focus after opening */
  autofocus?: boolean
  /** Drawer title */
  title?: DrawerRenderContent
  /** Placement of the drawer */
  placement?: DrawerPlacement
  /** Whether to show the close button */
  closable?: boolean
  /** Custom close icon */
  closeIcon?: DrawerRenderContent
  /** Width of the drawer (for left/right placement) */
  width?: string | number
  /** Height of the drawer (for top/bottom placement) */
  height?: string | number
  /** Preset size: 'default' (378px) or 'large' (736px) */
  size?: 'default' | 'large'
  /** Whether to show the mask overlay */
  mask?: boolean
  /** Whether clicking the mask closes the drawer */
  maskClosable?: boolean
  /** Whether pressing ESC closes the drawer */
  keyboard?: boolean
  /** Whether to destroy the drawer DOM when closed */
  destroyOnClose?: boolean
  /** Whether to pre-render the drawer even when closed */
  forceRender?: boolean
  /** Nested drawers push behavior */
  push?: DrawerPush
  /** Custom z-index */
  zIndex?: number
  /** Style for the drawer body */
  bodyStyle?: CSSProperties
  /** Style for the drawer panel */
  drawerStyle?: CSSProperties
  /** Style for the drawer footer */
  footerStyle?: CSSProperties
  /** Style for the drawer header */
  headerStyle?: CSSProperties
  /** Style for the drawer mask */
  maskStyle?: CSSProperties
  /** Function, selector, HTMLElement, or false for inline render */
  getContainer?: DrawerGetContainer
  /** Callback after open/close animation finishes */
  afterOpenChange?: (open: boolean) => void
  /** @deprecated Use `afterOpenChange` instead */
  afterVisibleChange?: (open: boolean) => void
  /** Extra header content (rendered at the right side of header) */
  extra?: DrawerRenderContent
  /** Drawer footer */
  footer?: DrawerRenderContent | false | null
  /** Class for the wrapper element */
  rootClassName?: string
  /** Style for the wrapper element */
  rootStyle?: CSSProperties
}

export const drawerDefaultProps = {
  autofocus: true,
  placement: 'right' as const,
  closable: true,
  size: 'default' as const,
  mask: true,
  maskClosable: true,
  keyboard: true,
  destroyOnClose: false,
  forceRender: false,
} as const

export interface DrawerEmits {
  (e: 'update:open', open: boolean): void
  /** @deprecated */
  (e: 'update:visible', open: boolean): void
  (e: 'close', event: MouseEvent | KeyboardEvent): void
  (e: 'afterOpenChange', open: boolean): void
  /** @deprecated */
  (e: 'afterVisibleChange', open: boolean): void
}

export interface DrawerSlots {
  default?: Slot
  title?: Slot
  extra?: Slot
  footer?: Slot
  closeIcon?: Slot
}

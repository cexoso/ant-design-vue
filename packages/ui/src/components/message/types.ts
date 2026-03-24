import type { VNode, CSSProperties } from 'vue'
import type { Slot } from '@/utils/types'

export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface MessageArgsProps {
  /** Message content */
  content: string | VNode | (() => VNode)
  /** Message type */
  type?: MessageType
  /** Duration in seconds (0 = never auto-close) */
  duration?: number
  /** Callback when message closes */
  onClose?: () => void
  /** Custom icon */
  icon?: VNode | (() => VNode)
  /** Unique key for update/destroy */
  key?: string | number
  /** Custom style */
  style?: CSSProperties
  /** Custom class */
  class?: string
}

export interface MessageConfigOptions {
  /** Distance from top of viewport */
  top?: number | string
  /** Default duration in seconds */
  duration?: number
  /** Max number of messages */
  maxCount?: number
  /** Container function */
  getContainer?: () => HTMLElement
  /** RTL mode */
  rtl?: boolean
}

export interface MessageInstance {
  info: MessageFn
  success: MessageFn
  error: MessageFn
  warning: MessageFn
  loading: MessageFn
  open: (args: MessageArgsProps) => MessageReturn
  destroy: (key?: string | number) => void
  config: (options: MessageConfigOptions) => void
}

export type MessageFn = (
  content: string | VNode | (() => VNode),
  duration?: number,
  onClose?: () => void,
) => MessageReturn

export interface MessageReturn {
  (): void // call to destroy
  then: (resolve: () => MessageReturn | void) => MessageReturn
}

export interface InternalMessageItem {
  id: string
  args: MessageArgsProps
}

export interface MessageSlots {
  default?: Slot
}

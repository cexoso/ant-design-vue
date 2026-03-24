import { createApp, reactive, type VNode } from 'vue'
import MessageContainer from './MessageContainer.vue'
import type {
  MessageArgsProps,
  MessageConfigOptions,
  MessageInstance,
  MessageReturn,
  MessageType,
  InternalMessageItem,
} from './types'

let seed = 0
function genId() {
  return `ant-message-${++seed}`
}

// Global state
const messages = reactive<InternalMessageItem[]>([])
const globalConfig: MessageConfigOptions = {
  top: 8,
  duration: 3,
  maxCount: undefined,
}

let mounted = false
let containerApp: ReturnType<typeof createApp> | null = null

function ensureMounted() {
  if (mounted || typeof document === 'undefined') return

  const container = document.createElement('div')
  document.body.appendChild(container)

  containerApp = createApp(MessageContainer, {
    messages,
    top: globalConfig.top,
    onClose: (id: string) => {
      removeMessage(id)
    },
  })

  containerApp.mount(container)
  mounted = true
}

function removeMessage(id: string) {
  const idx = messages.findIndex((m) => m.id === id)
  if (idx > -1) {
    const [item] = messages.splice(idx, 1)
    item.args.onClose?.()
  }
}

function createMessageReturn(destroyFn: () => void, duration: number): MessageReturn {
  const destroy = destroyFn as unknown as MessageReturn
  destroy.then = (resolve: () => MessageReturn | void) => {
    const next = createMessageReturn(() => {}, 0)
    setTimeout(() => {
      const result = resolve()
      if (result && typeof result.then === 'function') {
        next.then = result.then
      }
    }, duration * 1000)
    return next
  }
  return destroy
}

function addMessage(args: MessageArgsProps): MessageReturn {
  ensureMounted()

  // If key exists, update the existing message
  if (args.key != null) {
    const existing = messages.find((m) => m.args.key === args.key)
    if (existing) {
      existing.args = { ...args }
      const duration = args.duration ?? globalConfig.duration ?? 3
      return createMessageReturn(() => removeMessage(existing.id), duration)
    }
  }

  // Enforce maxCount
  if (globalConfig.maxCount && messages.length >= globalConfig.maxCount) {
    messages.splice(0, messages.length - globalConfig.maxCount + 1)
  }

  const id = genId()
  const item: InternalMessageItem = {
    id,
    args: {
      ...args,
      duration: args.duration ?? globalConfig.duration ?? 3,
    },
  }

  messages.push(item)

  return createMessageReturn(() => removeMessage(id), item.args.duration ?? 3)
}

function createTypeFn(type: MessageType) {
  return (
    content: string | VNode | (() => VNode),
    duration?: number,
    onClose?: () => void,
  ): MessageReturn => {
    return addMessage({ content, type, duration, onClose })
  }
}

export const message: MessageInstance = {
  info: createTypeFn('info'),
  success: createTypeFn('success'),
  error: createTypeFn('error'),
  warning: createTypeFn('warning'),
  loading: createTypeFn('loading'),
  open: (args: MessageArgsProps) => addMessage(args),
  destroy: (key?: string | number) => {
    if (key != null) {
      const item = messages.find((m) => m.args.key === key)
      if (item) removeMessage(item.id)
    } else {
      messages.splice(0, messages.length)
    }
  },
  config: (options: MessageConfigOptions) => {
    Object.assign(globalConfig, options)
  },
}

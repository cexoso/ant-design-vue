import type { ComputedRef, InjectionKey } from 'vue'

export type SizeType = 'sm' | 'md' | 'lg'
export type DirectionType = 'ltr' | 'rtl'

export interface ConfigProviderProps {
  /** Global component size */
  size?: SizeType
  /** Layout direction */
  direction?: DirectionType
  /** Globally disable all components */
  disabled?: boolean
  /** Return the container node for popup elements */
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}

export const configProviderDefaultProps = {
  size: 'md',
  direction: 'ltr',
  disabled: false,
} as const

export interface ConfigProviderContext {
  size: ComputedRef<SizeType>
  direction: ComputedRef<DirectionType>
  disabled: ComputedRef<boolean>
  getPopupContainer: ComputedRef<(triggerNode?: HTMLElement) => HTMLElement>
}

export const CONFIG_PROVIDER_KEY: InjectionKey<ConfigProviderContext> = Symbol('antdv-config')

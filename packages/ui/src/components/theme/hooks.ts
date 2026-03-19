import { inject, InjectionKey, provide, reactive, computed } from 'vue'
import type { ThemeProps } from './types'

export interface ThemeContext {
  appearance: string
  primaryColor: string
  backgroundColor: string
}

const THEME_KEY: InjectionKey<ThemeContext> = Symbol('antdv-theme')

export function useThemeProvide(props: ThemeProps) {
  const context = reactive<ThemeContext>({
    appearance: computed(() => props.appearance ?? 'light') as unknown as string,
    primaryColor: computed(() => props.primaryColor ?? '#1677FF') as unknown as string,
    backgroundColor: computed(() => props.backgroundColor ?? '#141414') as unknown as string,
  })
  provide(THEME_KEY, context)
}

export function useThemeInject(): ThemeContext {
  return inject(THEME_KEY, reactive<ThemeContext>({
    appearance: 'light',
    primaryColor: '#1677FF',
    backgroundColor: '#141414',
  }))
}

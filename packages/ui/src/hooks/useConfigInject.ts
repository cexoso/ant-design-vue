import { inject, computed } from 'vue'
import type { ConfigProviderContext, SizeType, DirectionType } from '../components/config-provider/types'
import { CONFIG_PROVIDER_KEY } from '../components/config-provider/types'
import { useThemeInject, type ThemeContext } from '../components/theme/hooks'

export interface ConfigContext {
  size: ConfigProviderContext['size']
  direction: ConfigProviderContext['direction']
  disabled: ConfigProviderContext['disabled']
  getPopupContainer: ConfigProviderContext['getPopupContainer']
  theme: ThemeContext
}

export function useConfigInject(): ConfigContext {
  const config = inject(CONFIG_PROVIDER_KEY, null)
  const theme = useThemeInject()

  return {
    size: config?.size ?? computed(() => 'md' as SizeType),
    direction: config?.direction ?? computed(() => 'ltr' as DirectionType),
    disabled: config?.disabled ?? computed(() => false),
    getPopupContainer: config?.getPopupContainer ?? computed(() => {
      return () => (typeof document !== 'undefined' ? document.body : null) as HTMLElement
    }),
    theme,
  }
}

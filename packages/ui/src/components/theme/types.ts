export interface ThemeProps {
  /** Visual appearance: light or dark mode */
  appearance?: 'light' | 'dark'
  /** Primary brand color, used to generate full color palette */
  primaryColor?: string
  /** Background color for dark mode */
  backgroundColor?: string
}

export const themeDefaultProps = {
  appearance: 'light',
  primaryColor: '#1677FF',
  backgroundColor: '#141414',
} as const

export const DEFAULT_PRIMARY_COLOR = '#1677FF'

export type ButtonVariant = 'solid' | 'outlined' | 'text' | 'link' | 'dashed' | 'filled'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonShape = 'default' | 'circle' | 'round'
export type ButtonHTMLType = 'submit' | 'button' | 'reset'

/** @deprecated Use `variant` instead */
export type ButtonLegacyType = 'primary' | 'default' | 'dashed' | 'text' | 'link'
/** @deprecated Use 'sm' | 'md' | 'lg' instead */
export type ButtonLegacySize = 'small' | 'middle' | 'large'

export interface ButtonProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** @deprecated Use `variant` instead. Maps: primary→solid, default→outlined, dashed→dashed, text→text, link→link */
  type?: ButtonLegacyType
  /** Button size */
  size?: ButtonSize | ButtonLegacySize
  /** Button shape */
  shape?: ButtonShape
  /** Show loading spinner. Pass `{ delay: ms }` to delay the loading state */
  loading?: boolean | { delay: number }
  /** Disabled state */
  disabled?: boolean
  /** Danger style */
  danger?: boolean
  /** Ghost style — transparent background */
  ghost?: boolean
  /** Full-width block button */
  block?: boolean
  /** Custom color — overrides theme primary color */
  color?: string
  /** If set, renders as `<a>` tag */
  href?: string
  /** Target for `<a>` tag */
  target?: string
  /** HTML button type attribute */
  htmlType?: ButtonHTMLType
}

export const buttonDefaultProps = {
  shape: 'default',
  disabled: false,
  danger: false,
  ghost: false,
  block: false,
  htmlType: 'button',
} as const

export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void
}

export interface ButtonSlots {
  default?: (props: Record<string, never>) => any
  icon?: (props: Record<string, never>) => any
  loading?: (props: Record<string, never>) => any
}

// --- Legacy mapping helpers ---

const TYPE_VARIANT_MAP: Record<string, ButtonVariant> = {
  primary: 'solid',
  default: 'outlined',
  dashed: 'dashed',
  text: 'text',
  link: 'link',
}

const SIZE_MAP: Record<string, ButtonSize> = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
}

export function resolveVariant(props: ButtonProps): ButtonVariant {
  if (props.variant) return props.variant
  if (props.type) return TYPE_VARIANT_MAP[props.type] ?? 'solid'
  return 'solid'
}

export function resolveSize(size: ButtonProps['size'] | undefined): ButtonSize {
  if (!size) return 'md'
  return SIZE_MAP[size] ?? (size as ButtonSize)
}

// --- ButtonGroup ---

export interface ButtonGroupProps {
  size?: ButtonSize | ButtonLegacySize
}

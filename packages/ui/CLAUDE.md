# @ant-design-vue/ui Refactoring Guide

## Project Overview
Refactoring ant-design-vue from JSX + CSS-in-JS to SFC + CSS files.
New package: `@ant-design-vue/ui`, independent of the old `ant-design-vue`.

## Core Principles
1. **Best practices, not translation** — Rethink each component from scratch using modern Vue 3.5+ patterns. Do NOT port old code line-by-line.
2. **SFC-first** — All components use `<script setup lang="ts">` + `<template>`.
3. **SSR-safe** — Never access `document`/`window` at module top-level or in `<script setup>`. Only in `onMounted`/`onBeforeUnmount` or behind `typeof window !== 'undefined'` guards.
4. **Incremental delivery** — One component per PR. Each PR must be self-contained with types, styles, tests, and exports.

## API Compatibility Strategy (Plan C)
- **Keep** high-frequency props from old API (e.g. `type` on Button maps to `variant` internally)
- **Keep** `v-model:value` pattern (antd-vue convention, not `v-model` / `modelValue`)
- **Keep** `size` accepting both old ('large'/'middle'/'small') and new ('lg'/'md'/'sm') values
- **Drop** `prefixCls` (internal concern, users never need it)
- **Drop** CSS-in-JS related APIs (useToken, StyleProvider, etc.)
- **Deprecation**: use `console.warn` with `[antdv]` prefix for deprecated props, only in dev mode

## Component File Structure
```
components/[name]/
├── [Name].vue              # Main SFC component
├── [SubName].vue           # Sub-components if any (e.g. ButtonGroup.vue)
├── types.ts                # All TypeScript types, props interfaces, emits
├── composables.ts          # Component-specific composables (if needed)
├── style/
│   └── index.css           # All styles, uses ant-* class names + @apply Tailwind
├── __tests__/
│   └── index.test.ts       # Vitest + Vue Test Utils
└── index.ts                # Exports + app.component() install
```

## Component Conventions

### types.ts
```typescript
// Props: TypeScript interface (not Options API object)
export interface ButtonProps {
  variant?: 'solid' | 'outlined' | 'text' | 'link' | 'dashed' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

// Defaults: plain object with `as const`
export const buttonDefaultProps = {
  variant: 'solid',
  size: 'md',
} as const

// Emits: TypeScript interface
export interface ButtonEmits {
  (e: 'click', event: MouseEvent): void
}

// Slots: TypeScript interface
export interface ButtonSlots {
  default?: (props: Record<string, never>) => any
  icon?: (props: Record<string, never>) => any
}
```

### SFC Template Rules
- Template uses ONLY `ant-*` semantic class names, NEVER Tailwind utility classes
- Use `:class` with computed for dynamic classes
- Use `v-bind` for style variables when needed
- Use `<component :is="tag">` for polymorphic elements (e.g. button/a)

### Style Rules (CSS files)
- Use `@reference` to import Tailwind config
- All styles scoped under `ant-*` class names
- Use `@apply` for Tailwind utilities inside CSS
- All colors MUST reference CSS variables (`--color-accent`, etc.)
- Use `:where()` for low-specificity selectors (easy to override)
- No `scoped` styles — all styles in CSS files

### index.ts Pattern
```typescript
import { App, Plugin } from 'vue'
import Button from './Button.vue'
import './style/index.css'

export { default as Button } from './Button.vue'
export * from './types'

Button.install = function (app: App) {
  app.component('AButton', Button)
  return app
}

export default Button as typeof Button & Plugin
```

## Styling Architecture

### CSS Output
The build produces two CSS files:
1. `dist/lib.css` — Compiled pure CSS (no Tailwind dependency for consumers)
2. Source CSS available in `src/` for advanced users

### Theme System
- CSS variables injected by `<Theme>` component
- `@ant-design/colors` generates color palette from primary color
- Variables defined in `base.css`, overridable by users
- Dark mode via `.dark-theme` class on root

### CSS Variable Naming
```
--color-accent-[1-10]       # Primary color palette
--color-accent              # Primary color (= accent-6)
--color-accent-hover        # Hover state (= accent-5)
--color-accent-active       # Active state (= accent-7)
--color-accent-content      # Text on primary bg
--color-neutral             # Text color
--color-neutral-secondary   # Secondary text
--color-neutral-disabled    # Disabled text
--color-neutral-border      # Border color
--color-neutral-bg          # Background
--color-error/warning/success/info  # Semantic colors
--ant-border-radius         # Global border radius
--ant-font-size             # Base font size
--ant-motion-duration       # Animation duration
```

## Internal Components
Located in `_internal/`, NOT exported to users:

- `trigger/` — Popup positioning based on @floating-ui/vue (replaces vc-trigger)
- `portal/` — Teleport wrapper with getPopupContainer support
- `virtual-list/` — Virtual scrolling for large lists

## Floating Components (Popover/Tooltip/Modal/Dropdown)
All use `@floating-ui/vue` for positioning:
- Tooltip/Popover/Popconfirm → `_internal/trigger`
- Modal/Drawer → `_internal/portal` + Dialog element or floating-ui
- Dropdown/Select/Cascader → `_internal/trigger` + virtual-list

## Testing Standards
- Every component MUST have tests
- Test: rendering, props, events, slots, accessibility basics
- Use `mount()` from @vue/test-utils
- Snapshot tests for basic rendering
- No implementation-detail testing (don't test internal state)

## PR Workflow
Each PR contains exactly ONE component (or one foundational change):
1. Create branch: `feat/[component-name]`
2. Implement component following conventions above
3. Write tests
4. Update `components/index.ts` to export
5. PR title: `feat([component]): add [Component] component`

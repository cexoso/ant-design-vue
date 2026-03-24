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
├── demo/
│   ├── basic.vue           # Basic usage demo
│   └── [feature].vue       # One demo per feature (size.vue, loading.vue, etc.)
├── __tests__/
│   ├── index.test.ts       # Unit tests (Vitest + Vue Test Utils)
│   └── demo.test.ts        # Demo snapshot tests
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

// Emits: TypeScript interface (Vue handles array handlers at runtime, no wrapping needed)
// ONLY declare events the component explicitly emits (e.g. 'change', 'update:value')
// Do NOT declare native DOM events (click, focus, mouseenter, etc.) — Vue's inheritAttrs
// handles transparent passthrough. Declaring them would intercept the native event and
// require manual emit, adding unnecessary code with no benefit.
export interface ButtonEmits {
  // Button has no custom emits — native click is handled by inheritAttrs
}

// Slots: use Slot (no props) or ScopedSlot<T> (with props) from @/utils/types
// - NEVER use multiple parameters — always single object, destructured by user
// - No-props slots: Slot
// - Scoped slots: ScopedSlot<{ key: Type }>
import type { Slot, ScopedSlot } from '@/utils/types'
export interface ButtonSlots {
  default?: Slot
  icon?: Slot
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
- **Demo snapshot tests**: Each component MUST have `demo.test.ts` that renders all demos and snapshots them
- Global test setup (`test/setup.ts`) registers all components via `app.use(UI)` — demos work with `<a-button>` etc.

## Dev Server (Playground)
Preview demos locally: `cd apps/playground && pnpm dev`
- Runs Vite dev server at `http://localhost:5173`
- Auto-discovers all `components/*/demo/*.vue` files via custom `demoGlobPlugin`
- Supports live code editing, theme toggle, source code preview
- Config: `apps/playground/vite.config.ts`

### Demo Conventions
- Each demo is a standalone `.vue` SFC — no special blocks needed
- Use registered component names (`<a-button>`, `<a-divider>`, etc.)
- One demo per feature, named descriptively: `basic.vue`, `size.vue`, `loading.vue`
- Keep demos simple and focused — showcase one feature per file
- All visible text in demos MUST be in English (labels, placeholders, descriptions, etc.)

## PR Workflow
Each PR contains exactly ONE component (or one foundational change):
1. Create branch: `feat/[component-name]`
2. Implement component following conventions above
3. Write demos in `demo/` directory
4. Write unit tests + demo snapshot tests
5. Update `components/index.ts` to export
6. PR title: `feat([component]): add [Component] component`

## Community PR Review Workflow
When asked to review a community PR (e.g. "review PR #1234"):

### 1. Gather context
- `gh pr view <number>` — read title, description, changed files
- `gh pr diff <number>` — read the full diff
- Read the **current state** of changed files on the target branch for comparison

### 2. Review against project standards
Check all changes against this CLAUDE.md, focusing on:
- **API conventions**: types.ts patterns, props/emits/slots interfaces
- **SFC rules**: `<script setup>`, template uses only `ant-*` classes
- **Style rules**: CSS variables, `:where()` specificity, no Tailwind in templates
- **Demo rules**: English text only, one feature per demo, sufficient coverage
- **Test coverage**: meaningful tests, not just happy path
- **Code quality**: no duplication, no unnecessary complexity, SSR-safe
- **Accessibility**: aria attributes, keyboard navigation
- **No unnecessary changes**: playground/main.ts, unrelated files

### 3. Write structured review
Categorize issues by severity:
- **Must fix** — blocks merge (convention violations, bugs, missing coverage)
- **Should fix** — improves quality (duplication, naming, demo gaps)
- **Consider** — optional improvements (comments, minor refactors)
- **Positive** — explicitly call out well-done parts

### 4. Leave comment on PR
Post the review via `gh pr comment <number>`. **All PR comments MUST be written in English** — this is an international open-source project.

### 5. Push fixes directly (if `maintainerCanModify: true`)
- `gh pr view <number> --json headRefName,headRepositoryOwner,maintainerCanModify`
- If allowed: add contributor's fork as remote, checkout their branch, apply fixes
- Run tests: `npx vitest run packages/ui/src/components/<name>`
- Commit with descriptive message, push to their branch
- Switch back to `feat/vapor` when done

### 6. Merge decision
After fixes are applied and tests pass, confirm with maintainer before merging.

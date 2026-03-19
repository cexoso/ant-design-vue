# @ant-design-vue/ui Refactor Plan

## Core Decisions

| Decision | Choice |
|----------|--------|
| Package name | `@ant-design-vue/ui` (new package) |
| Component style | SFC `<script setup lang="ts">` |
| Styling | CSS files + CSS variables, Tailwind dev-time only, output pure CSS |
| Theme | CSS variables + `@ant-design/colors` palette generation |
| Floating/Popup | `@floating-ui/vue` replaces all vc-trigger/vc-dialog |
| API compat | Plan C: high-frequency props compatible, low-frequency dropped |
| v-model | `v-model:value` (antd-vue convention) |
| Types | `types.ts` per component |
| SSR | Must be safe, no browser API at top-level |
| Delivery | One component per PR |

## PR Execution Sequence

Status: `[ ]` todo · `[~]` in progress · `[x]` done

### Phase 0: Foundation

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 0 | `feat/infra` | Theme (SSR-safe), ConfigProvider (basic), useConfigInject hook, base.css CSS variables, fix Wave.vue, fix utils/ TS types |

### Phase 1: Layout & Basic

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 1 | `feat/button` | Button + ButtonGroup. Compat: `type` prop alias, old size values. Add: htmlType, block, ghost, loading.delay, href→`<a>`, expose focus/blur |
| [ ] PR 2 | `feat/flex` | Flex. Fix `componentTag`→`component` compat |
| [ ] PR 3 | `feat/affix` | Affix. Fix utils passive option bug |
| [ ] PR 4 | `feat/divider` | Divider |
| [ ] PR 5 | `feat/grid` | Row + Col. Responsive breakpoints, gutter |
| [ ] PR 6 | `feat/space` | Space. Compact, split, wrap |
| [ ] PR 7 | `feat/layout` | Layout + Header + Footer + Sider + Content |
| [ ] PR 8 | `feat/typography` | Text + Title + Paragraph + Link. Copyable, ellipsis, editable |

### Phase 2: Internal Infra for Floating

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 9 | `feat/trigger` | `_internal/trigger` (floating-ui) + `_internal/portal` (Teleport wrapper) |

### Phase 3: Form Components

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 10 | `feat/input` | Input + TextArea + Password + Search + InputGroup. v-model:value, prefix/suffix/addon, allowClear, showCount |
| [ ] PR 11 | `feat/input-number` | InputNumber. Step, precision, formatter |
| [ ] PR 12 | `feat/checkbox` | Checkbox + CheckboxGroup |
| [ ] PR 13 | `feat/radio` | Radio + RadioGroup + RadioButton |
| [ ] PR 14 | `feat/switch` | Switch |
| [ ] PR 15 | `feat/select` | Select + Option + OptGroup. Depends on PR 9 + virtual-list |
| [ ] PR 16 | `feat/form` | Form + FormItem. async-validator |

### Phase 4: Feedback & Overlay

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 17 | `feat/tooltip` | Tooltip. Depends on PR 9 |
| [ ] PR 18 | `feat/popover` | Popover |
| [ ] PR 19 | `feat/popconfirm` | Popconfirm |
| [ ] PR 20 | `feat/dropdown` | Dropdown + DropdownButton. Depends on PR 9 |
| [ ] PR 21 | `feat/modal` | Modal + confirm/info/success/error/warning |
| [ ] PR 22 | `feat/drawer` | Drawer |
| [ ] PR 23 | `feat/message` | Message (imperative API) |
| [ ] PR 24 | `feat/notification` | Notification (imperative API) |

### Phase 5: Navigation

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 25 | `feat/menu` | Menu + SubMenu + MenuItem + MenuItemGroup |
| [ ] PR 26 | `feat/tabs` | Tabs + TabPane |
| [ ] PR 27 | `feat/pagination` | Pagination |
| [ ] PR 28 | `feat/breadcrumb` | Breadcrumb + BreadcrumbItem |
| [ ] PR 29 | `feat/steps` | Steps + Step |
| [ ] PR 30 | `feat/anchor` | Anchor + AnchorLink |

### Phase 6: Data Display

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 31 | `feat/table` | Table + Column + ColumnGroup. Virtual scroll, sorter, filter |
| [ ] PR 32 | `feat/tag` | Tag + CheckableTag |
| [ ] PR 33 | `feat/badge` | Badge + Ribbon |
| [ ] PR 34 | `feat/avatar` | Avatar + AvatarGroup |
| [ ] PR 35 | `feat/card` | Card + CardMeta + CardGrid |
| [ ] PR 36 | `feat/collapse` | Collapse + CollapsePanel |
| [ ] PR 37 | `feat/descriptions` | Descriptions + DescriptionsItem |
| [ ] PR 38 | `feat/empty` | Empty |
| [ ] PR 39 | `feat/image` | Image + ImagePreviewGroup |
| [ ] PR 40 | `feat/list` | List + ListItem + ListItemMeta |
| [ ] PR 41 | `feat/statistic` | Statistic + Countdown |
| [ ] PR 42 | `feat/timeline` | Timeline + TimelineItem |
| [ ] PR 43 | `feat/tree` | Tree + DirectoryTree. Virtual scroll |

### Phase 7: Remaining

| PR | Branch | Scope |
|----|--------|-------|
| [ ] PR 44 | `feat/alert` | Alert |
| [ ] PR 45 | `feat/progress` | Progress (line, circle, dashboard) |
| [ ] PR 46 | `feat/spin` | Spin |
| [ ] PR 47 | `feat/skeleton` | Skeleton |
| [ ] PR 48 | `feat/result` | Result |
| [ ] PR 49 | `feat/cascader` | Cascader. Depends on trigger + virtual-list |
| [ ] PR 50 | `feat/tree-select` | TreeSelect. Depends on trigger + tree |
| [ ] PR 51 | `feat/date-picker` | DatePicker + RangePicker |
| [ ] PR 52 | `feat/time-picker` | TimePicker |
| [ ] PR 53 | `feat/transfer` | Transfer |
| [ ] PR 54 | `feat/upload` | Upload + Dragger |
| [ ] PR 55 | `feat/mentions` | Mentions |
| [ ] PR 56 | `feat/auto-complete` | AutoComplete |
| [ ] PR 57 | `feat/rate` | Rate |
| [ ] PR 58 | `feat/slider` | Slider |
| [ ] PR 59 | `feat/carousel` | Carousel |
| [ ] PR 60 | `feat/calendar` | Calendar |
| [ ] PR 61 | `feat/segmented` | Segmented |
| [ ] PR 62 | `feat/qrcode` | QRCode |
| [ ] PR 63 | `feat/watermark` | Watermark |
| [ ] PR 64 | `feat/tour` | Tour |
| [ ] PR 65 | `feat/float-button` | FloatButton + FloatButtonGroup + BackTop |
| [ ] PR 66 | `feat/app` | App (message/notification/modal context) |
| [ ] PR 67 | `feat/config-provider` | ConfigProvider full version (locale, component config) |

## Dependency Graph

```
Foundation (PR 0)
└── All components depend on Theme + useConfigInject

_internal/trigger (PR 9)
├── Tooltip (17) → Popover (18), Popconfirm (19)
├── Dropdown (20) → Menu submenu popup
├── Select (15), Cascader (49), TreeSelect (50)
├── DatePicker (51), TimePicker (52)
├── Mentions (55), AutoComplete (56)
└── Tour (64)

_internal/portal (PR 9)
├── Modal (21), Drawer (22)
├── Message (23), Notification (24)
└── Image preview (39)

_internal/virtual-list (introduced with first consumer)
├── Select (15), Table (31)
├── Tree (43), TreeSelect (50)
└── Cascader (49)

Form (16) ← needs form controls (Input, Select, Checkbox, Radio, Switch, etc.)
Table (31) ← biggest component, do after simpler ones stabilize
```

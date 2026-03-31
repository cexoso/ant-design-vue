import { afterEach, describe, expect, it } from 'vitest'
import { Drawer } from '@ant-design-vue/ui'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import MultiLevelDemo from '../demo/multi-level-drawer.vue'

const globalStubs = {
  global: {
    stubs: {
      teleport: true,
    },
  },
}

const mountedWrappers: Array<{ unmount: () => void }> = []

function mountTracked(component: any, options?: any) {
  const wrapper = mount(component, options)
  mountedWrappers.push(wrapper)
  return wrapper
}

function mountDrawer(options?: any) {
  return mountTracked(Drawer, options)
}

async function flushDrawerMotion() {
  await nextTick()
  await nextTick()
  await nextTick()
  await nextTick()
  await nextTick()
  await nextTick()
}

function mountMultiLevelDrawer(options?: { placement?: 'left' | 'right' | 'top' | 'bottom'; push?: any }) {
  const component = defineComponent({
    components: { Drawer },
    props: {
      placement: {
        type: String,
        default: options?.placement ?? 'right',
      },
      push: {
        type: [Boolean, Object],
        default: options?.push,
      },
    },
    setup() {
      const open = ref(true)
      const childOpen = ref(false)

      return { open, childOpen }
    },
    template: `
      <Drawer v-model:open="open" get-container="false" :placement="placement" :push="push" class="outer-drawer">
        <button class="open-child" @click="childOpen = true">Open child</button>
        <button class="close-child" @click="childOpen = false">Close child</button>
        <Drawer v-model:open="childOpen" get-container="false" :placement="placement" class="inner-drawer">
          <div class="inner-content">Two-level drawer</div>
        </Drawer>
      </Drawer>
    `,
  })

  return mountTracked(component)
}

function getVisibleMasks() {
  return Array.from(document.body.querySelectorAll('.ant-drawer-mask')).filter(mask => {
    return (mask as HTMLElement).style.display !== 'none'
  })
}

function getVisibleDrawerTitles() {
  return Array.from(document.body.querySelectorAll('.ant-drawer-title'))
    .filter(title => {
      const wrapper = title.closest('.ant-drawer-content-wrapper') as HTMLElement | null
      return wrapper?.style.display !== 'none'
    })
    .map(title => title.textContent?.trim())
}

afterEach(() => {
  mountedWrappers.splice(0).reverse().forEach(wrapper => wrapper.unmount())
  document.body.style.overflow = ''
  document.body.style.overflowX = ''
  document.body.style.overflowY = ''
  document.body.style.paddingRight = ''
  document.body.style.width = ''
})

describe('Drawer', () => {
  it('should render correctly when open', () => {
    const wrapper = mountDrawer({
      props: { open: true, title: 'Test Drawer' },
      slots: { default: 'Drawer content' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').exists()).toBe(true)
    expect(wrapper.find('.ant-drawer-title').text()).toBe('Test Drawer')
    expect(wrapper.find('.ant-drawer-body').text()).toBe('Drawer content')
  })

  it('should not render when not open', () => {
    const wrapper = mountDrawer({
      props: { open: false, title: 'Hidden' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').exists()).toBe(false)
  })

  it('defaults to right placement', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').classes()).toContain('ant-drawer-right')
  })

  it('applies left placement', () => {
    const wrapper = mountDrawer({
      props: { open: true, placement: 'left' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').classes()).toContain('ant-drawer-left')
  })

  it('applies top placement', () => {
    const wrapper = mountDrawer({
      props: { open: true, placement: 'top' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').classes()).toContain('ant-drawer-top')
  })

  it('applies bottom placement', () => {
    const wrapper = mountDrawer({
      props: { open: true, placement: 'bottom' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').classes()).toContain('ant-drawer-bottom')
  })

  it('renders close button when closable', () => {
    const wrapper = mountDrawer({
      props: { open: true, closable: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-close').exists()).toBe(true)
  })

  it('hides close button when closable is false', () => {
    const wrapper = mountDrawer({
      props: { open: true, closable: false },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-close').exists()).toBe(false)
  })

  it('emits close when close button clicked', async () => {
    const wrapper = mountDrawer({
      props: { open: true, closable: true },
      ...globalStubs,
    })
    await wrapper.find('.ant-drawer-close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
  })

  it('supports visible prop for backward compatibility', () => {
    const wrapper = mountDrawer({
      props: { visible: true, title: 'Legacy Drawer' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').exists()).toBe(true)
    expect(wrapper.find('.ant-drawer-title').text()).toBe('Legacy Drawer')
  })

  it('renders mask', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-mask').exists()).toBe(true)
  })

  it('hides mask when mask is false', () => {
    const wrapper = mountDrawer({
      props: { open: true, mask: false },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-mask').exists()).toBe(false)
  })

  it('closes when mask is clicked', async () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })

    await wrapper.find('.ant-drawer-mask').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('does not close when maskClosable is false', async () => {
    const wrapper = mountDrawer({
      props: { open: true, maskClosable: false },
      ...globalStubs,
    })

    await wrapper.find('.ant-drawer-mask').trigger('click')

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('closes when pressing Escape', async () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })

    await wrapper.find('.ant-drawer').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('does not close when keyboard is false', async () => {
    const wrapper = mountDrawer({
      props: { open: true, keyboard: false },
      ...globalStubs,
    })

    await wrapper.find('.ant-drawer').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.emitted('update:open')).toBeUndefined()
  })

  it('applies custom width', () => {
    const wrapper = mountDrawer({
      props: { open: true, width: 500 },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('width: 500px')
  })

  it('treats numeric string width as pixels', () => {
    const wrapper = mountDrawer({
      props: { open: true, width: '520' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('width: 520px')
  })

  it('applies custom height for top placement', () => {
    const wrapper = mountDrawer({
      props: { open: true, placement: 'top', height: 300 },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('height: 300px')
  })

  it('treats numeric string height as pixels', () => {
    const wrapper = mountDrawer({
      props: { open: true, placement: 'top', height: '300' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('height: 300px')
  })

  it('renders title slot', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      slots: { title: '<span class="custom-title">Custom Title</span>' },
      ...globalStubs,
    })
    expect(wrapper.find('.custom-title').exists()).toBe(true)
  })

  it('renders extra slot', () => {
    const wrapper = mountDrawer({
      props: { open: true, title: 'Test' },
      slots: { extra: '<button class="extra-btn">Extra</button>' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-extra').exists()).toBe(true)
    expect(wrapper.find('.extra-btn').exists()).toBe(true)
  })

  it('renders footer slot', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      slots: { footer: '<button class="footer-btn">Footer</button>' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-footer').exists()).toBe(true)
    expect(wrapper.find('.footer-btn').exists()).toBe(true)
  })

  it('hides footer when no slot provided', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-footer').exists()).toBe(false)
  })

  it('has proper aria attributes', () => {
    const wrapper = mountDrawer({
      props: { open: true, title: 'Accessible Drawer' },
      ...globalStubs,
    })
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.exists()).toBe(true)
    expect(dialog.attributes('aria-modal')).toBe('true')
  })

  it('applies rootClassName', () => {
    const wrapper = mountDrawer({
      props: { open: true, rootClassName: 'my-drawer' },
      ...globalStubs,
    })
    expect(wrapper.find('.my-drawer').exists()).toBe(true)
  })

  it('applies rootStyle to the wrapper element', () => {
    const wrapper = mountDrawer({
      props: { open: true, rootStyle: { color: 'blue' } },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-root').attributes('style')).toContain('color: blue')
  })

  it('applies class and style attrs to the drawer panel', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      attrs: {
        class: 'panel-class',
        style: 'color: red;',
      },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').classes()).toContain('panel-class')
    expect(wrapper.find('.ant-drawer').attributes('style')).toContain('color: red')
  })

  it('applies bodyStyle', () => {
    const wrapper = mountDrawer({
      props: { open: true, bodyStyle: { padding: '48px' } },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-body').attributes('style')).toContain('padding: 48px')
  })

  it('uses default size (378px)', () => {
    const wrapper = mountDrawer({
      props: { open: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('width: 378px')
  })

  it('uses large size (736px)', () => {
    const wrapper = mountDrawer({
      props: { open: true, size: 'large' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-content-wrapper').attributes('style')).toContain('width: 736px')
  })

  it('applies footerStyle when footer is rendered', () => {
    const wrapper = mountDrawer({
      props: { open: true, footerStyle: { textAlign: 'right' } },
      slots: { footer: '<button>Footer</button>' },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-footer').attributes('style')).toContain('text-align: right')
  })

  it('supports forceRender when closed', () => {
    const wrapper = mountDrawer({
      props: { open: false, forceRender: true },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer').exists()).toBe(true)
  })

  it('renders inline when getContainer is false', () => {
    const wrapper = mountDrawer({
      props: { open: true, getContainer: false },
    })
    expect(wrapper.find('.ant-drawer-root').classes()).toContain('ant-drawer-inline')
  })

  it('does not lock body scroll when rendering inline', () => {
    mountDrawer({
      props: { open: true, getContainer: false },
    })

    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(document.body.style.width).toBe('')
  })

  it('does not treat omitted getContainer as inline rendering', async () => {
    mountDrawer({
      attachTo: document.body,
      props: { open: true },
    })

    await flushDrawerMotion()

    const root = document.body.querySelector('.ant-drawer-root') as HTMLElement | null

    expect(root).not.toBeNull()
    expect(root?.classList.contains('ant-drawer-inline')).toBe(false)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not lock body scroll when mask is false', () => {
    mountDrawer({
      props: { open: true, mask: false },
      ...globalStubs,
    })

    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(document.body.style.width).toBe('')
  })

  it('applies maskStyle', () => {
    const wrapper = mountDrawer({
      props: { open: true, maskStyle: { background: 'rgba(1, 2, 3, 0.5)' } },
      ...globalStubs,
    })
    expect(wrapper.find('.ant-drawer-mask').attributes('style')).toContain('background: rgba(1, 2, 3, 0.5)')
  })

  it('pushes parent drawer in multi-level right placement', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'right' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-content-wrapper')[0].element as HTMLElement).style.transform).toBe(
      'translateX(-180px)',
    )

    await wrapper.find('.close-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-content-wrapper')[0].element as HTMLElement).style.transform).toBe('')
  })

  it('pushes parent drawer in multi-level left placement', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'left' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-content-wrapper')[0].element as HTMLElement).style.transform).toBe(
      'translateX(180px)',
    )
  })

  it('pushes parent drawer in multi-level top placement', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'top' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-content-wrapper')[0].element as HTMLElement).style.transform).toBe(
      'translateY(180px)',
    )
  })

  it('does not push parent drawer when push is false', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'right', push: false })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-content-wrapper')[0].element as HTMLElement).style.transform).toBe('')
  })

  it('disables parent mask interaction while child drawer is open', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'right' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.findAll('.ant-drawer-mask')[0].element as HTMLElement).style.pointerEvents).toBe('none')
    expect((wrapper.findAll('.ant-drawer-mask')[1].element as HTMLElement).style.pointerEvents).toBe('')
  })

  it('stacks child drawer layers above parent layers', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'right' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    const wrappers = wrapper.findAll('.ant-drawer-content-wrapper')
    const masks = wrapper.findAll('.ant-drawer-mask')

    expect((wrappers[0].element as HTMLElement).style.zIndex).toBe('1000')
    expect((wrappers[1].element as HTMLElement).style.zIndex).toBe('1010')
    expect((masks[0].element as HTMLElement).style.zIndex).toBe('1000')
    expect((masks[1].element as HTMLElement).style.zIndex).toBe('1010')
  })

  it('resets child drawer state when parent drawer closes', async () => {
    const wrapper = mountMultiLevelDrawer({ placement: 'right' })

    await flushDrawerMotion()
    await wrapper.find('.open-child').trigger('click')
    await flushDrawerMotion()

    expect((wrapper.vm as any).childOpen).toBe(true)

    ;(wrapper.vm as any).open = false
    await flushDrawerMotion()

    expect((wrapper.vm as any).childOpen).toBe(false)

    ;(wrapper.vm as any).open = true
    await flushDrawerMotion()

    const visibleWrappers = wrapper
      .findAll('.ant-drawer-content-wrapper')
      .filter(node => (node.element as HTMLElement).style.display !== 'none')
    expect(visibleWrappers).toHaveLength(1)
  })

  it('renders separate roots and masks for multi-level demo', async () => {
    const wrapper = mountTracked(MultiLevelDemo, { attachTo: document.body })

    await wrapper.find('button').trigger('click')
    await flushDrawerMotion()

    const childTrigger = document.body.querySelector('.ant-drawer-body .ant-btn') as HTMLElement | null
    childTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushDrawerMotion()

    expect(document.body.querySelectorAll('.ant-drawer-root')).toHaveLength(2)
    expect(document.body.querySelectorAll('.ant-drawer-mask')).toHaveLength(2)
    expect(
      Array.from(document.body.querySelectorAll('.ant-drawer-title')).map(node => node.textContent?.trim()),
    ).toEqual(['Multi-level drawer', 'Two-level Drawer'])
  })

  it('teleports nested demo drawers and applies default push when props are omitted', async () => {
    const wrapper = mountTracked(MultiLevelDemo, { attachTo: document.body })

    await wrapper.find('button').trigger('click')
    await flushDrawerMotion()

    const childTrigger = document.body.querySelector('.ant-drawer-body .ant-btn') as HTMLElement | null
    childTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushDrawerMotion()

    const roots = Array.from(document.body.querySelectorAll('.ant-drawer-root')) as HTMLElement[]
    const wrappers = Array.from(document.body.querySelectorAll('.ant-drawer-content-wrapper')) as HTMLElement[]

    expect(roots).toHaveLength(2)
    expect(roots.map(root => root.classList.contains('ant-drawer-inline'))).toEqual([false, false])
    expect(roots[1]?.closest('.ant-drawer-body')).toBeNull()
    expect(wrappers[0]?.style.transform).toBe('translateX(-180px)')
    expect(wrappers[0]?.style.width).toBe('520px')
    expect(wrappers[1]?.style.width).toBe('320px')
  })

  it('closes only the active child drawer when clicking the topmost mask', async () => {
    const wrapper = mountTracked(MultiLevelDemo, { attachTo: document.body })

    await wrapper.find('button').trigger('click')
    await flushDrawerMotion()

    const childTrigger = document.body.querySelector('.ant-drawer-body .ant-btn') as HTMLElement | null
    childTrigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushDrawerMotion()

    const masks = Array.from(document.body.querySelectorAll('.ant-drawer-mask')) as HTMLElement[]
    masks.at(-1)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushDrawerMotion()

    expect(getVisibleMasks()).toHaveLength(1)
    expect(getVisibleDrawerTitles()).toEqual(['Multi-level drawer'])
  })

})

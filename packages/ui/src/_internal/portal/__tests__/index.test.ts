import { afterEach, describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { Portal } from '..'

const mountedWrappers: Array<{ unmount: () => void }> = []
const mountedHosts: HTMLElement[] = []

function mountTracked(component: any, options?: any) {
  const wrapper = mount(component, options)
  mountedWrappers.push(wrapper)
  return wrapper
}

function createMountHost() {
  const host = document.createElement('div')
  document.body.appendChild(host)
  mountedHosts.push(host)
  return host
}

async function flushPortalUpdate() {
  await nextTick()
  await flushPromises()
}

function mountPortalHarness() {
  const component = defineComponent({
    components: { Portal },
    setup() {
      const getContainer = ref<string | HTMLElement | (() => HTMLElement) | false | undefined>(undefined)
      return { getContainer }
    },
    template: `
      <div class="portal-shell">
        <Portal :visible="true" :get-container="getContainer">
          <input class="portal-input" />
        </Portal>
      </div>
    `,
  })

  return mountTracked(component, { attachTo: document.body })
}

afterEach(() => {
  mountedWrappers.splice(0).reverse().forEach(wrapper => wrapper.unmount())
  mountedHosts.splice(0).reverse().forEach(host => host.remove())
})

describe('Portal', () => {
  it('preserves DOM state when switching from created container to inline rendering', async () => {
    const wrapper = mountPortalHarness()

    await flushPortalUpdate()

    const input = document.body.querySelector('.portal-input') as HTMLInputElement | null
    expect(input).not.toBeNull()

    const originalContainer = input?.parentElement as HTMLElement | null
    input!.value = 'draft value'

    ;(wrapper.vm as any).getContainer = false
    await flushPortalUpdate()

    const movedInput = wrapper.find('.portal-input').element as HTMLInputElement
    expect(movedInput.value).toBe('draft value')
    expect(document.body.contains(originalContainer)).toBe(false)
  })

  it('preserves DOM state when switching from created container to a custom container', async () => {
    const wrapper = mountPortalHarness()
    const targetHost = createMountHost()

    await flushPortalUpdate()

    const input = document.body.querySelector('.portal-input') as HTMLInputElement | null
    expect(input).not.toBeNull()

    const originalContainer = input?.parentElement as HTMLElement | null
    input!.value = 'draft value'

    ;(wrapper.vm as any).getContainer = targetHost
    await flushPortalUpdate()

    const movedInput = targetHost.querySelector('.portal-input') as HTMLInputElement | null
    expect(movedInput?.value).toBe('draft value')
    expect(document.body.contains(originalContainer)).toBe(false)
  })

  it('does not create a default container when getContainer changes while hidden', async () => {
    const component = defineComponent({
      components: { Portal },
      setup() {
        const visible = ref(false)
        const getContainer = ref<string | HTMLElement | (() => HTMLElement) | false | undefined>(undefined)
        return { visible, getContainer }
      },
      template: `
        <Portal :visible="visible" :get-container="getContainer">
          <input class="portal-input" />
        </Portal>
      `,
    })

    const wrapper = mountTracked(component, { attachTo: document.body })
    const bodyChildCount = document.body.childElementCount

    ;(wrapper.vm as any).getContainer = '.missing-container'
    await flushPortalUpdate()

    expect(document.body.childElementCount).toBe(bodyChildCount)
    expect(wrapper.find('.portal-input').exists()).toBe(true)
  })
})

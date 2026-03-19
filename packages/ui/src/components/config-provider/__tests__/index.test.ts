import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ConfigProvider from '../ConfigProvider.vue'
import { useConfigInject } from '@/hooks'

// Helper that reads config context
const ConfigReader = defineComponent({
  setup() {
    const { size, direction, disabled } = useConfigInject()
    return { size, direction, disabled }
  },
  render() {
    return h('div', {
      'data-size': this.size,
      'data-direction': this.direction,
      'data-disabled': String(this.disabled),
    })
  },
})

describe('ConfigProvider', () => {
  it('renders slot content', () => {
    const wrapper = mount(ConfigProvider, {
      slots: { default: '<span>child</span>' },
    })
    expect(wrapper.find('span').text()).toBe('child')
  })

  it('provides default config when no props given', () => {
    const wrapper = mount(ConfigProvider, {
      slots: { default: () => h(ConfigReader) },
    })
    const reader = wrapper.findComponent(ConfigReader)
    expect(reader.attributes('data-size')).toBe('md')
    expect(reader.attributes('data-direction')).toBe('ltr')
    expect(reader.attributes('data-disabled')).toBe('false')
  })

  it('provides custom size to children', () => {
    const wrapper = mount(ConfigProvider, {
      props: { size: 'lg' },
      slots: { default: () => h(ConfigReader) },
    })
    const reader = wrapper.findComponent(ConfigReader)
    expect(reader.attributes('data-size')).toBe('lg')
  })

  it('provides direction to children', () => {
    const wrapper = mount(ConfigProvider, {
      props: { direction: 'rtl' },
      slots: { default: () => h(ConfigReader) },
    })
    const reader = wrapper.findComponent(ConfigReader)
    expect(reader.attributes('data-direction')).toBe('rtl')
  })

  it('provides disabled state to children', () => {
    const wrapper = mount(ConfigProvider, {
      props: { disabled: true },
      slots: { default: () => h(ConfigReader) },
    })
    const reader = wrapper.findComponent(ConfigReader)
    expect(reader.attributes('data-disabled')).toBe('true')
  })

  it('updates config reactively', async () => {
    const wrapper = mount(ConfigProvider, {
      props: { size: 'sm' },
      slots: { default: () => h(ConfigReader) },
    })
    const reader = wrapper.findComponent(ConfigReader)
    expect(reader.attributes('data-size')).toBe('sm')

    await wrapper.setProps({ size: 'lg' })
    expect(reader.attributes('data-size')).toBe('lg')
  })

  it('provides defaults without ConfigProvider wrapper', () => {
    const wrapper = mount(ConfigReader)
    expect(wrapper.attributes('data-size')).toBe('md')
    expect(wrapper.attributes('data-direction')).toBe('ltr')
    expect(wrapper.attributes('data-disabled')).toBe('false')
  })
})

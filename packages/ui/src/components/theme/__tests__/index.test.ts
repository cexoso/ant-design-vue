import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import Theme from '../Theme.vue'
import { useThemeInject } from '../hooks'

// Helper component that reads theme context
const ThemeReader = defineComponent({
  setup() {
    const theme = useThemeInject()
    return { theme }
  },
  render() {
    return h('div', {
      'data-appearance': this.theme.appearance,
      'data-primary': this.theme.primaryColor,
    })
  },
})

afterEach(() => {
  document.documentElement.classList.remove('light-theme', 'dark-theme')
})

describe('Theme', () => {
  it('renders slot content', () => {
    const wrapper = mount(Theme, {
      slots: { default: '<div class="child">hello</div>' },
    })
    expect(wrapper.find('.child').text()).toBe('hello')
  })

  it('injects a <style> tag with CSS variables', () => {
    const wrapper = mount(Theme)
    const style = wrapper.find('style')
    expect(style.exists()).toBe(true)
    expect(style.text()).toContain('--color-accent')
    expect(style.text()).toContain(':root')
  })

  it('provides theme context to children', () => {
    const wrapper = mount(Theme, {
      props: { primaryColor: '#ff0000' },
      slots: { default: () => h(ThemeReader) },
    })
    const reader = wrapper.findComponent(ThemeReader)
    expect(reader.attributes('data-primary')).toBe('#ff0000')
  })

  it('applies appearance class to documentElement on mount', () => {
    mount(Theme, { props: { appearance: 'dark' } })
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
  })

  it('uses light appearance by default', () => {
    mount(Theme)
    expect(document.documentElement.classList.contains('light-theme')).toBe(true)
  })

  it('switches appearance class reactively', async () => {
    const wrapper = mount(Theme, { props: { appearance: 'light' } })
    expect(document.documentElement.classList.contains('light-theme')).toBe(true)

    await wrapper.setProps({ appearance: 'dark' })
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)
    expect(document.documentElement.classList.contains('light-theme')).toBe(false)
  })

  it('cleans up appearance class on unmount', () => {
    const wrapper = mount(Theme, { props: { appearance: 'dark' } })
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true)

    wrapper.unmount()
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false)
  })

  it('provides default values when no Theme wrapper', () => {
    const wrapper = mount(ThemeReader)
    expect(wrapper.attributes('data-appearance')).toBe('light')
    expect(wrapper.attributes('data-primary')).toBe('#1677FF')
  })
})

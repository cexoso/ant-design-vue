import { afterEach, describe, expect, it } from 'vitest'
import { Drawer, Image, ImagePreviewGroup } from '@ant-design-vue/ui'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ImagePreview from '../ImagePreview.vue'

const mountedWrappers: Array<{ unmount: () => void }> = []

function mountTracked(component: any, options?: any) {
  const wrapper = mount(component, options)
  mountedWrappers.push(wrapper)
  return wrapper
}

const globalStubs = {
  global: {
    stubs: {
      teleport: true,
    },
  },
}

async function flushOverlayState() {
  await nextTick()
  await flushPromises()
}

afterEach(() => {
  mountedWrappers.splice(0).reverse().forEach(wrapper => wrapper.unmount())
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('Image', () => {
  it('should render correctly', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', alt: 'Test' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders image with src and alt', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', alt: 'Alt text' },
    })
    const img = wrapper.find('.ant-image-img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/image.png')
    expect(img.attributes('alt')).toBe('Alt text')
  })

  it('applies width and height', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', width: 200, height: 150 },
    })
    const img = wrapper.find('.ant-image-img')
    expect(img.attributes('width')).toBe('200')
    expect(img.attributes('height')).toBe('150')
  })

  it('shows preview mask when preview is enabled', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', preview: true },
    })
    expect(wrapper.find('.ant-image-mask').exists()).toBe(true)
    expect(wrapper.find('.ant-image-mask-info').text()).toContain('Preview')
  })

  it('hides preview mask when preview is false', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', preview: false },
    })
    expect(wrapper.find('.ant-image-mask').exists()).toBe(false)
  })

  it('emits click event on image click', async () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', preview: false },
    })
    await wrapper.find('.ant-image-img').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits error event when image fails to load', async () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/broken.png' },
    })
    await wrapper.find('.ant-image-img').trigger('error')
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('uses fallback src when image fails to load', async () => {
    const wrapper = mountTracked(Image, {
      props: {
        src: 'https://example.com/broken.png',
        fallback: 'https://example.com/fallback.png',
      },
    })
    await wrapper.find('.ant-image-img').trigger('error')
    expect(wrapper.find('.ant-image-img').attributes('src')).toBe(
      'https://example.com/fallback.png',
    )
  })

  it('hides preview mask after error (cannot preview broken image)', async () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/broken.png' },
    })
    await wrapper.find('.ant-image-img').trigger('error')
    expect(wrapper.find('.ant-image-mask').exists()).toBe(false)
  })

  it('applies wrapperClassName and wrapperStyle', () => {
    const wrapper = mountTracked(Image, {
      props: {
        src: 'https://example.com/image.png',
        wrapperClassName: 'custom-wrapper',
        wrapperStyle: { border: '1px solid red' },
      },
    })
    expect(wrapper.find('.ant-image').classes()).toContain('custom-wrapper')
    expect((wrapper.find('.ant-image').element as HTMLElement).style.border).toBe('1px solid red')
  })

  it('renders placeholder slot', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png', placeholder: true },
      slots: { placeholder: '<span class="custom-placeholder">Loading...</span>' },
    })
    expect(wrapper.find('.custom-placeholder').exists()).toBe(true)
  })

  it('renders custom previewMask slot', () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png' },
      slots: { previewMask: '<span class="custom-mask">View</span>' },
    })
    expect(wrapper.find('.custom-mask').exists()).toBe(true)
    expect(wrapper.find('.custom-mask').text()).toBe('View')
  })

  it('opens preview when image is clicked', async () => {
    const wrapper = mountTracked(Image, {
      props: { src: 'https://example.com/image.png' },
    })
    await wrapper.find('.ant-image-img').trigger('click')
    await nextTick()
    // Preview should be rendered in portal
    expect(wrapper.findComponent({ name: 'AImagePreview' }).exists()).toBe(true)
  })

  it('shares body scroll lock with drawer overlays', async () => {
    const previewWrapper = mountTracked(ImagePreview, {
      props: { open: true, src: 'https://example.com/image.png' },
      ...globalStubs,
    })
    const drawerWrapper = mountTracked(Drawer, {
      props: { open: true, title: 'Drawer' },
      slots: { default: 'Drawer content' },
      ...globalStubs,
    })

    await flushOverlayState()

    expect(document.body.style.overflow).toBe('hidden')

    await previewWrapper.setProps({ open: false })
    await flushOverlayState()

    expect(document.body.style.overflow).toBe('hidden')

    await drawerWrapper.setProps({ open: false })
    await flushOverlayState()

    expect(document.body.style.overflow).toBe('')
  })
})

describe('ImagePreviewGroup', () => {
  it('should render correctly', () => {
    const wrapper = mountTracked(ImagePreviewGroup, {
      slots: { default: '<div class="child">Child</div>' },
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders children in group wrapper', () => {
    const wrapper = mountTracked(ImagePreviewGroup, {
      slots: { default: '<div class="child">Images here</div>' },
    })
    expect(wrapper.find('.ant-image-preview-group').exists()).toBe(true)
    expect(wrapper.find('.child').exists()).toBe(true)
  })
})

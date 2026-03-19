import './style/tailwind.css'
import { App } from 'vue'

import * as components from './components'
export * from './components'
export * from './hooks'

export const install = function (app: App) {
  Object.keys(components).forEach(key => {
    const component = (components as Record<string, any>)[key]
    if (component.install) {
      app.use(component)
    }
  })
  return app
}

export default {
  install,
}

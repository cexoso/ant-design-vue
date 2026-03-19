import { App, Plugin } from 'vue'
import Theme from './Theme.vue'

export { default as Theme } from './Theme.vue'
export * from './types'
export * from './hooks'

Theme.install = function (app: App) {
  app.component('ATheme', Theme)
  return app
}

export default Theme as typeof Theme & Plugin

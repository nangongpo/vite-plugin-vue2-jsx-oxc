import Vue from 'vue'
import App from './App.vue'
import { registerGlobalComponents } from './register-global-components'

registerGlobalComponents()

export function createApp() {
  return new Vue({
    render: h => h(App)
  })
}
